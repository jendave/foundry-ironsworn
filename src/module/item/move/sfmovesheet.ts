import sfmoveSheetVue from '../../vue/sfmove-sheet.vue'
import { VueItemSheet } from '../../vue/vueitemsheet'

export class SFMoveSheet extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { height: 650 },
		rootComponent: sfmoveSheetVue,
	}
}
