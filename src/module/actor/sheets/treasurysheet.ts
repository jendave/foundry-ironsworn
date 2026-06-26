import treasurySheetVue from '../../vue/treasury-sheet.vue'
import { VueActorSheet } from '../../vue/vueactorsheet'

export class TreasurySheet extends VueActorSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 475, height: 700 },
		rootComponent: treasurySheetVue,
	}
}
