import type { ActorDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData'
import { IronswornActor } from '../actor/actor'
import { IronswornSettings } from '../helpers/settings'
import { OracleTable } from '../roll-table/oracle-table'
import { IronswornCharacterSheetV2 } from '../actor/sheets/charactersheet-v2'
import { StarforgedCharacterSheet } from '../actor/sheets/sf-charactersheet'

/** Look up the registered sheet ID for a given sheet class, so we never rely on the minified class name. */
function getSheetId(sheetClass: new (...args: any[]) => any): string | undefined {
	const sheets: Record<string, any> = (CONFIG as any).Actor?.sheetClasses?.character ?? {}
	return Object.values(sheets).find((s: any) => s.cls === sheetClass)?.id as string | undefined
}

interface DialogButton {
	kind: string
	labelKey: string
	img: string
	ironsworn?: boolean
	starforged?: boolean
}

const DIALOG_BUTTONS: DialogButton[] = [
	{
		kind: 'shared',
		labelKey: 'IRONSWORN.ACTOR.TypeShared',
		img: 'icons/environment/settlement/wagon-black.webp',
		ironsworn: true,
		starforged: true,
	},
	{
		kind: 'treasury',
		labelKey: 'IRONSWORN.ACTOR.TypeTreasury',
		img: 'icons/commodities/currency/coin-embossed-crown-gold.webp',
		ironsworn: true,
		starforged: true,
	},
	{
		kind: 'site',
		labelKey: 'IRONSWORN.ACTOR.TypeDelveSite',
		img: 'icons/environment/wilderness/cave-entrance-vulcano.webp',
		ironsworn: true,
	},
	{
		kind: 'foe',
		labelKey: 'IRONSWORN.ACTOR.TypeFoe',
		img: 'icons/creatures/eyes/lizard-single-slit-pink.webp',
		ironsworn: true,
		starforged: true,
	},
	{
		kind: 'sfship',
		labelKey: 'IRONSWORN.ACTOR.TypeStarship',
		img: 'systems/foundry-ironsworn/assets/starships/Ship-10s.webp',
		starforged: true,
	},
	{
		kind: 'sflocation',
		labelKey: 'IRONSWORN.ACTOR.TypeLocation',
		img: 'systems/foundry-ironsworn/assets/planets/Starforged-Planet-Token-Ocean-02.webp',
		starforged: true,
	},
]

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class CreateActorDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	folder: string | undefined

	constructor(folder?: string) {
		super({})
		this.folder = folder
	}

	static get buttonsForEnabledContent() {
		return DIALOG_BUTTONS.filter(
			(x) =>
				(x.ironsworn &&
					IronswornSettings.enabledRulesets.includes('classic')) ||
				(x.starforged &&
					IronswornSettings.enabledRulesets.includes('starforged'))
		)
	}

	static get DEFAULT_OPTIONS() {
		const buttons = this.buttonsForEnabledContent
		const rulesets = IronswornSettings.enabledRulesets
		const bothKinds =
			rulesets.includes('classic') && rulesets.includes('starforged')
		const height =
			45 + // Title bar
			50 * (buttons.length + 1) + // Button height
			(bothKinds ? 55 : 0) + // Space for bigger box if both kinds are enabled
			10 // Padding so the last button's border isn't clipped
		return {
			id: 'new-actor-dialog',
			classes: ['ironsworn', 'sheet', 'new-actor'],
			position: { width: 350, height, left: window.innerWidth - 675, top: 40 },
			window: {
				title: game.i18n.format('DOCUMENT.Create', {
					type: game.i18n.localize('DOCUMENT.Actor'),
				}),
				resizable: false,
			},
		}
	}

	static PARTS = {
		form: {
			template: 'systems/foundry-ironsworn/templates/actor/create.hbs',
		},
	}

	async _prepareContext(_options?: object): Promise<object> {
		const rulesets = IronswornSettings.enabledRulesets
		const classic = rulesets.includes('classic')
		const starforged = rulesets.includes('starforged')
		return {
			buttons: CreateActorDialog.buttonsForEnabledContent,
			classic,
			starforged,
			both: classic && starforged,
		}
	}

	_onRender(_context: object, _options: object): void {
		const element = this.element as HTMLElement

		const on = (selector: string, fn: (ev: MouseEvent) => Promise<void>) => {
			element
				.querySelector(selector)
				?.addEventListener('click', (ev) => void fn(ev as MouseEvent))
		}

		on('.ironsworn__character__create', (ev) => this._characterCreate(ev))
		on('.ironsworn__shared__create', (ev) => this._sharedCreate(ev))
		on('.ironsworn__treasury__create', (ev) => this._treasuryCreate(ev))
		on('.ironsworn__site__create', (ev) => this._siteCreate(ev))
		on('.ironsworn__foe__create', (ev) => this._foeCreate(ev))
		on('.ironsworn__sfcharacter__create', (ev) => this._sfcharacterCreate(ev))
		on('.ironsworn__sfship__create', (ev) => this._sfshipCreate(ev))
		on('.ironsworn__sflocation__create', (ev) => this._sfLocationCreate(ev))
	}

	async _characterCreate(ev: MouseEvent) {
		ev.preventDefault()
		const img = (ev.currentTarget as HTMLElement).dataset.img || undefined
		const table = await OracleTable.getByDsId(
			'oracle_rollable:classic/name/ironlander'
		)
		const drawResult = await table?.draw({ displayChat: false })
		void this._createWithFolder(
			drawResult?.results[0]?.description ||
				game.i18n.localize(CONFIG.Actor.typeLabels.character),
			'character',
			img,
			getSheetId(IronswornCharacterSheetV2)
		)
	}

	async _sharedCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.shared),
			'shared',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _treasuryCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.treasury),
			'treasury',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _siteCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.site),
			'site',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _foeCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.foe),
			'foe',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _sfcharacterCreate(ev: MouseEvent) {
		ev.preventDefault()
		const img = (ev.currentTarget as HTMLElement).dataset.img || undefined
		const name = await this._randomStarforgedName()
		void this._createWithFolder(
			name || game.i18n.localize(CONFIG.Actor.typeLabels.character),
			'character',
			img,
			getSheetId(StarforgedCharacterSheet)
		)
	}

	async _sfshipCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.starship),
			'starship',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _sfLocationCreate(ev: MouseEvent) {
		ev.preventDefault()
		void this._createWithFolder(
			game.i18n.localize(CONFIG.Actor.typeLabels.location),
			'location',
			(ev.currentTarget as HTMLElement).dataset.img || undefined
		)
	}

	async _createWithFolder(
		name: string,
		type: IronswornActor['type'],
		img: string | undefined,
		sheetClass?: string
	) {
		const data: ActorDataConstructorData & Record<string, any> = {
			name,
			img,
			type,
			prototypeToken: { actorLink: true },
			folder: this.folder || undefined,
		}
		if (sheetClass) {
			data.flags = { core: { sheetClass } }
		}
		const actor = await IronswornActor.create(data)
		await new Promise((resolve) => setTimeout(resolve, 50))
		await (actor?.sheet as any)?.render({ force: true })
		await (this as any).close()
	}

	async _randomStarforgedName(): Promise<string | undefined> {
		const [givenName, familyName] = await OracleTable.ask(
			[
				'oracle_rollable:starforged/character/name/given_name',
				'oracle_rollable:starforged/character/name/family_name',
			],
			{ displayChat: false }
		)
		return `${givenName?.results[0]?.description} ${familyName?.results[0]?.description}`
	}
}
