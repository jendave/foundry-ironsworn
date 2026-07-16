import starshipSheetVue from '../../vue/starship-sheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'

export class StarshipSheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 500, height: 500 },
		rootComponent: starshipSheetVue,
	}
}
