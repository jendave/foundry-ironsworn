import ledgerEntrySheetVue from '../../vue/ledger-entry-sheet.vue'
import { VueItemSheet } from '../../vue/vueitemsheet'

export class LedgerEntrySheet extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { height: 550 },
		rootComponent: ledgerEntrySheetVue,
	}

	readonly hasEditMode = false
}
