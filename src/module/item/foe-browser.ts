import FoeBrowserVue from '../vue/foe-browser.vue'
import { VueAppMixin } from '../vue/vueapp.js'

const { ApplicationV2 } = foundry.applications.api

export class FoeBrowser extends VueAppMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		window: {
			title: 'IRONSWORN.Foes',
			resizable: true,
		},
		position: { width: 450, height: 600, left: 25 },
		rootComponent: FoeBrowserVue,
	}
}
