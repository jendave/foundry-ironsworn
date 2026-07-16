import CharacterMoveSheet from '../../vue/sf-charactermovesheet.vue'
import type { IronswornActor } from '../actor'
import type { App } from 'vue'
import { $ActorKey } from '../../vue/provisions'
import { VueAppMixin } from '../../vue/vueapp.js'
import { MoveSheetTour } from '../../features/tours/move-sheet-tour'

const { ApplicationV2 } = foundry.applications.api

export class SFCharacterMoveSheet extends VueAppMixin(ApplicationV2) {
	constructor(
		protected actor: IronswornActor,
		options?: object
	) {
		super(options ?? {})
	}

	static DEFAULT_OPTIONS = {
		classes: ['ironsworn', 'ironsworn-movesheet'],
		position: { width: 350, height: 980, left: 685 },
		window: {
			resizable: true,
			controls: [
				{
					action: 'openHelp',
					icon: 'fa fa-circle-question',
					label: 'IRONSWORN.Tour',
				},
			],
		},
		actions: {
			async openHelp(this: SFCharacterMoveSheet) {
				await new MoveSheetTour(this).start()
			},
		},
		rootComponent: CharacterMoveSheet,
	}

	get title(): string {
		return `${game.i18n.localize('IRONSWORN.ITEMS.TypeMove')} — ${this.actor.name}`
	}

	setupVueApp(app: App<any>): void {
		app.provide($ActorKey, this.actor)
	}

	async _getVueData(): Promise<object> {
		return {
			actor: this.actor.toObject(),
		}
	}

	activateTab(tabKey: string) {
		this.localEmitter.emit('activateTab', tabKey)
	}
}

// When changing actor sheets, make sure we don't get a stale move sheet
Hooks.on('preUpdateActor', async (actor: IronswornActor, data: any) => {
	if (actor.type === 'character' && data.flags?.core?.sheetClass) {
		await actor.moveSheet?.close()
		actor.moveSheet = undefined
	}
})
Hooks.on('preUpdateSetting', async (setting: Setting, data: any) => {
	if (setting.key === 'core.sheetClasses') {
		for (const actor of game.actors ?? []) {
			await actor.moveSheet?.close()
			actor.moveSheet = undefined
		}
	}
})
