import AssetCompendiumBrowserVue from '../vue/asset-compendium-browser.vue'
import { VueAppMixin } from '../vue/vueapp.js'

const { ApplicationV2 } = foundry.applications.api

export class AssetCompendiumBrowser extends VueAppMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		window: {
			title: 'IRONSWORN.ITEMS.TypeAsset',
			resizable: true,
		},
		position: { width: 400, height: 600 },
		rootComponent: AssetCompendiumBrowserVue,
	}
}
