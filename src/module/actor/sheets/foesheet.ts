import foeSheetVue from '../../vue/components/foe-sheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'

export class FoeSheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 450, height: 500 },
		actions: {
			// Override edit mode: open the progress item sheet instead
			toggleEditMode(this: FoeSheet) {
				const item = this.actor?.items?.find((x: any) => x.type === 'progress')
				void item?.sheet?.render({ force: true })
			},
		},
		rootComponent: foeSheetVue,
	}
}
