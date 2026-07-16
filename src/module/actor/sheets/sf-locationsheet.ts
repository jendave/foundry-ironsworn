import sfLocationsheetVue from '../../vue/sf-locationsheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'

export class StarforgedLocationSheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 600, height: 600 },
		rootComponent: sfLocationsheetVue,
	}
}
