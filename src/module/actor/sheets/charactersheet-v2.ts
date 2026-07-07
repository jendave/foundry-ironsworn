import { ISCharacterTour } from '../../features/tours/is-character-tour'
import characterSheetVue from '../../vue/character-sheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'
import { SFCharacterMoveSheet } from './sf-charactermovesheet'

export class IronswornCharacterSheetV2 extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 700, height: 980, left: 50 },
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
			openMoveSheet(this: IronswornCharacterSheetV2) {
				this._openMoveSheet()
			},
			async openHelp(this: IronswornCharacterSheetV2) {
				await new ISCharacterTour(this.actor).start()
			},
		},
		rootComponent: characterSheetVue,
	}

	activateTab(tabKey: string) {
		this.localEmitter.emit('activateTab', tabKey)
	}

	async _onFirstRender(context: object, options: object) {
		await super._onFirstRender?.(context, options)
		this._openMoveSheet()
	}

	_openMoveSheet() {
		this.actor.moveSheet ||= new SFCharacterMoveSheet(this.actor, {
			position: { left: 755 },
		})
		void this.actor.moveSheet.render({ force: true })
	}
}
