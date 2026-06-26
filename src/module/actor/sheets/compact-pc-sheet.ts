import { VueActorSheet } from '../../vue/vueactorsheet'
import CompactCharacterSheet from '../../vue/compact-charactersheet.vue'
import { SFCharacterMoveSheet } from './sf-charactermovesheet'

export class CompactPCSheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 560, height: 210 },
		window: {
			controls: [
				{
					action: 'openMoveSheet',
					icon: 'fas fa-directions',
					label: 'IRONSWORN.ITEMS.TypeMove',
				},
			],
		},
		actions: {
			openMoveSheet(this: CompactPCSheet) {
				this._openMoveSheet()
			},
		},
		rootComponent: CompactCharacterSheet,
	}

	_openMoveSheet() {
		this.actor.moveSheet ||= new SFCharacterMoveSheet(this.actor)
		void this.actor.moveSheet.render({ force: true })
	}
}
