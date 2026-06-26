import { VueAppMixin } from '../vue/vueapp'
import OracleWindowComponent from '../vue/oracle-window.vue'

const { ApplicationV2 } = foundry.applications.api

export class OracleWindow extends VueAppMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: 'oracles',
		window: {
			title: 'IRONSWORN.ROLLTABLES.TypeOracle',
			resizable: true,
		},
		position: { width: 350, height: 400 },
		rootComponent: OracleWindowComponent,
	}
}
