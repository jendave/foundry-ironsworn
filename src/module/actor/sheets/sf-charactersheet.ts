import { SFCharacterTour } from '../../features/tours/sf-character-tour'
import SfCharacterSheet from '../../vue/sf-charactersheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'
import { SFCharacterMoveSheet } from './sf-charactermovesheet'

export class StarforgedCharacterSheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 630, height: 980, left: 50 },
		window: {
			resizable: true,
			controls: [
				{
					action: 'openMoveSheet',
					icon: 'fas fa-directions',
					label: 'IRONSWORN.ITEMS.TypeMove',
				},
				{
					action: 'openHelp',
					icon: 'fa fa-circle-question',
					label: 'IRONSWORN.Tour',
				},
			],
		},
		actions: {
			openMoveSheet(this: StarforgedCharacterSheet) {
				this._openMoveSheet()
			},
			async openHelp(this: StarforgedCharacterSheet) {
				await new SFCharacterTour(this.actor).start()
			},
		},
		rootComponent: SfCharacterSheet,
	}

	activateTab(tabKey: string) {
		this.localEmitter.emit('activateTab', tabKey)
	}

	async _onFirstRender(context: object, options: object) {
		// @ts-expect-error super._onFirstRender exists on V2 base
		await super._onFirstRender?.(context, options)
		this._openMoveSheet()
	}

	_openMoveSheet() {
		this.actor.moveSheet ||= new SFCharacterMoveSheet(this.actor)
		void this.actor.moveSheet.render({ force: true })
	}
}
