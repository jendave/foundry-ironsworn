import assetSheetVue from '../../vue/asset-sheet.vue'
import { VueItemSheet } from '../../vue/vueitemsheet'

export class AssetSheetV2 extends VueItemSheet {
	static DEFAULT_OPTIONS = {
		position: { width: 450 },
		rootComponent: assetSheetVue,
	}
}
