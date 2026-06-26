import progressSheetVue from '../../vue/progress-sheet.vue'
import { VueItemSheet } from '../../vue/vueitemsheet'

export class ProgressSheetV2 extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { height: 550 },
		rootComponent: progressSheetVue,
	}

	readonly hasEditMode = false
}
