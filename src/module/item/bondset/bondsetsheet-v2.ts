import bondsetSheetVue from '../../vue/bondset-sheet.vue'
import { VueItemSheet } from '../../vue/vueitemsheet'

export class BondsetSheetV2 extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 800 },
		rootComponent: bondsetSheetVue,
	}
}
