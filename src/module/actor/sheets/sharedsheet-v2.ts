import sharedSheetVue from '../../vue/shared-sheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'

export class IronswornSharedSheetV2 extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 425, height: 700 },
		rootComponent: sharedSheetVue,
	}
}
