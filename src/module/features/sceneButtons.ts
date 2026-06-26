import { IronswornActor } from '../actor/actor'
import { OracleWindow } from '../applications/oracle-window'
import { EditSectorDialog } from '../applications/sf/editSectorApp'
import { createSiMoonsChatMessage } from '../chat/si-moons-chat-message'
import { IronswornSettings } from '../helpers/settings'
import { cinderAndWraithifyRoll } from './dice'

function warn() {
	ui.notifications?.warn('Soon™')
}

// Make sure a folder exists, e.g. ['Locations', 'Sector 05']
async function ensureFolder(...path: string[]): Promise<Folder | undefined> {
	let parentFolder: Folder | undefined
	let directory: Folder[] | undefined = game.folders?.filter(
		(x) => x.type === 'Actor'
	)

	for (const name of path) {
		if (directory === undefined) {
			ui.notifications?.warn('Actor folders not found???')
			return
		}
		const existing = directory.find((x) => x.name === name)
		if (existing != null) {
			parentFolder = existing
			directory = (existing as any).children.map((child) => {
				return child.folder /* v10 */ || child /* v9 */
			})
			continue
		}
		parentFolder = await Folder.create({
			type: 'Actor',
			name,
			folder: parentFolder?.id
		})
		directory = (parentFolder as any).children
	}
	return parentFolder
}

async function editSector() {
	const sceneId = game.user?.viewedScene
	if (sceneId) {
		await new EditSectorDialog(sceneId).render({ force: true })
	}
}

async function rollMoons() {
	// Roll the dice
	const r = new Roll('{d10[Cinder],d10[Wraith]}')
	cinderAndWraithifyRoll(r)
	await r.roll()
	const [cinder, wraith] = (r.terms[0] as PoolTerm).rolls
	await createSiMoonsChatMessage(cinder, wraith)
}

async function dropToken(location: IronswornActor) {
	if (canvas?.scene == null || canvas.stage == null || canvas.grid == null)
		return

	// Calculate coordinates in the center of the viewport
	const { clientWidth, clientHeight } = document.documentElement
	const [cx, cy] = [clientWidth / 2, clientHeight / 2]
	const t = canvas.stage.worldTransform
	const scale = canvas.stage.scale
	const [x, y] = [(cx - t.tx) / scale.x, (cy - t.ty) / scale.y]

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const td: any = await (location as any).getTokenDocument({ x, y }, { parent: canvas.scene })

	// v14: _getDropActorPosition handles center→top-left conversion, snapping, level, and elevation
	const tokenCls = CONFIG.Token.objectClass as any
	if (typeof tokenCls._getDropActorPosition === 'function') {
		const position = tokenCls._getDropActorPosition(td, { x, y }, { snap: true })
		td.updateSource(position)
	} else {
		// v13 fallback
		const grid = canvas.grid as any
		const hw = grid.sizeX / 2
		const hh = grid.sizeY / 2
		const pos = grid.getSnappedPoint(
			{ x: td.x - td.width * hw, y: td.y - td.height * hh },
			{ mode: (CONST as any).GRID_SNAPPING_MODES.CENTER }
		)
		td.updateSource({ x: pos.x, y: pos.y })
	}

	// TODO: avoid dropping this on top of another token

	canvas.tokens?.activate()
	await td.constructor.create(td, { parent: canvas.scene })
}

async function newLocation(subtype: string, i18nKey: string, scale = 1) {
	const name = game.i18n.format('DOCUMENT.New', {
		type: game.i18n.localize(`IRONSWORN.${i18nKey}`)
	})
	const parentFolder = await ensureFolder(
		'Locations',
		game.scenes?.current?.name ?? '???'
	)
	const loc = await IronswornActor.create({
		type: 'location',
		name,
		system: { subtype },
		prototypeToken: {
			displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
			disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
			actorLink: true,
			'texture.scaleX': scale,
			'texture.scaleY': scale
		},
		folder: parentFolder?.id
	})
	if (loc == null) return

	await dropToken(loc)
	loc?.sheet?.render(true)
}

function newPlanet() {
	newLocation('planet', 'ACTOR.SubtypePlanet')
}

function newStar() {
	newLocation('star', 'ACTOR.SubtypeStar')
}

function newSettlement() {
	newLocation('settlement', 'ACTOR.SubtypeSettlement', 2)
}

function newDerelict() {
	newLocation('derelict', 'ACTOR.SubtypeDerelict', 2)
}

function newVault() {
	newLocation('vault', 'ACTOR.SubtypeVault', 2)
}

function newIsland() {
	newLocation('island', 'ACTOR.SubtypeIsland')
}

function newSiSettlement() {
	newLocation('sunderedsettlement', 'ACTOR.SubtypeSettlement')
}

let ORACLE_WINDOW: OracleWindow | undefined
function theOracleWindow() {
	if (ORACLE_WINDOW == null) ORACLE_WINDOW = new OracleWindow()
	return ORACLE_WINDOW
}

function addTool(control: SceneControl, tool: SceneControlTool) {
	const anyCtrl = control as any
	anyCtrl.tools ||= {}
	anyCtrl.tools[tool.name] = tool
}

export function activateSceneButtonListeners() {
	CONFIG.Canvas.layers.ironsworn = {
		// @ts-expect-error
		layerClass: IronswornCanvasLayer,
		group: 'primary'
	}

	Hooks.on('getSceneControlButtons', (controls: any) => {
		const oracleButton: SceneControlTool = {
			name: 'oracles',
			title: game.i18n.localize('IRONSWORN.ROLLTABLES.TypeOracle'),
			icon: 'isicon-oracle',
			visible: true,
			button: true,
			onChange: async () => await theOracleWindow().render({ force: true })
		}

		if (controls.tokens) {
			controls.tokens.tools.oracles = oracleButton
		} else {
			controls[0].tools.push(oracleButton)
		}

		const control: SceneControl = {
			name: 'ironsworn',
			title: game.i18n.localize('IRONSWORN.StarforgedTools'),
			icon: 'isicon-logo-starforged-dk',
			layer: 'ironsworn',
			visible: true,
			tools: {}
		} as any
		addTool(control, oracleButton)

		// Apply updates in order for all enabled rulesets
		if (IronswornSettings.enabledRulesets.includes('classic')) {
			ironswornifyControl(control)
		}
		if (IronswornSettings.enabledRulesets.includes('starforged')) {
			starforgifyControl(control)
		}
		if (IronswornSettings.enabledRulesets.includes('sundered_isles')) {
			sunderedIslifyControl(control)
		}

		if (controls[0]) {
			controls.push(control)
		} else {
			controls.ironsworn = control
		}
		return controls
	})
}

function ironswornifyControl(control: SceneControl) {
	control.title = game.i18n.localize('IRONSWORN.IronswornTools')
	control.icon = 'isicon-logo-ironsworn-dk'
}

function starforgifyControl(control: SceneControl) {
	control.title = game.i18n.localize('IRONSWORN.Starforged')
	control.icon = 'isicon-logo-starforged-dk'

	if (game.user?.isGM) {
		addTool(control, {
			name: 'edit',
			icon: 'isicon-region-sf',
			title: game.i18n.format('DOCUMENT.Update', {
				type: game.i18n.localize('IRONSWORN.SCENE.TypeSector')
			}),
			button: true,
			onChange: editSector
		})
		// { // TODO: maybe reenable this when we have a good way of doing it
		//   name: 'sector',
		//   icon: 'isicon-sector',
		//   title: game.i18n.format('DOCUMENT.Create',{type: ('IRONSWORN.SCENE.TypeSector')}),
		//   onChange: warn,
		// }
		addTool(control, {
			name: 'star',
			icon: 'isicon-stellar-object',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeStar')
			}),
			button: true,
			onChange: newStar
		})
		addTool(control, {
			name: 'planet',
			icon: 'isicon-world',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypePlanet')
			}),
			button: true,
			onChange: newPlanet
		})
		addTool(control, {
			name: 'settlement',
			icon: 'isicon-settlement-sf',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeSettlement')
			}),
			button: true,
			onChange: newSettlement
		})
		addTool(control, {
			name: 'derelict',
			icon: 'isicon-derelict',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeDerelict')
			}),
			button: true,
			onChange: newDerelict
		})
		addTool(control, {
			name: 'vault',
			icon: 'isicon-precursor-vault',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeVault')
			}),
			button: true,
			onChange: newVault
		})
	}
}

function sunderedIslifyControl(control: SceneControl) {
	control.title = game.i18n.localize('IRONSWORN.SunderedIslesTools')
	control.icon = 'isicon-logo-sunderedisles-dk'
	addTool(control, {
		name: 'moons',
		icon: 'fas fa-moon',
		title: 'Roll the Moons',
		button: true,
		onChange: rollMoons
	})

	if (game.user?.isGM) {
		addTool(control, {
			name: 'edit',
			icon: 'isicon-region-si',
			title: game.i18n.format('DOCUMENT.Update', {
				type: game.i18n.localize('IRONSWORN.SCENE.TypeChart')
			}),
			button: true,
			onChange: editSector
		})
		addTool(control, {
			name: 'island',
			icon: 'isicon-island',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeIsland')
			}),
			button: true,
			onChange: newIsland
		})
		addTool(control, {
			name: 'sisettlement',
			icon: 'isicon-settlement-si',
			title: game.i18n.format('DOCUMENT.Create', {
				type: game.i18n.localize('IRONSWORN.ACTOR.SubtypeSettlement')
			}),
			button: true,
			onChange: newSiSettlement
		})
	}
}

class IronswornCanvasLayer extends foundry.canvas.layers.InteractionLayer {
	static get layerOptions() {
		return foundry.utils.mergeObject(super.layerOptions, {
			zIndex: 180,
			name: 'ironsworn'
		})
	}

	get placeables() {
		return []
	}
}

Hooks.on('getSceneNavigationContext', (_html, contextOptions) => {
	contextOptions.push({
		name: game.i18n.format('DOCUMENT.Update', {
			type: game.i18n.localize('IRONSWORN.SCENE.TypeChart')
		}),
		icon: '<i class="fa isicon-region-si" style="display: inline-block;"></i>',
		condition: game.user?.isGM,
		callback: editSector
	})
})
