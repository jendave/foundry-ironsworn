import { VueItemSheet } from '../../vue/vueitemsheet'
import delveThemeDomainSheet from '../../vue/delve-theme-domain-sheet.vue'

export class ThemeDomainSheet extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { height: 650 },
		rootComponent: delveThemeDomainSheet,
	}
}
