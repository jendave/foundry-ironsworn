import { IronswornSettings } from '../../helpers/settings'
import editSectorVue from '../../vue/edit-sector.vue'
import { VueAppMixin } from '../../vue/vueapp.js'

const { ApplicationV2 } = foundry.applications.api

export class EditSectorDialog extends VueAppMixin(ApplicationV2) {
	constructor(protected sceneId: string) {
		super({})
	}

	static get DEFAULT_OPTIONS() {
		let title = game.i18n.localize('IRONSWORN.SCENE.TypeSector')
		if (IronswornSettings.enabledRulesets.includes('sundered_isles')) {
			title = game.i18n.localize('IRONSWORN.SCENE.TypeChart')
		}
		return {
			id: 'edit-sector-dialog',
			window: { title, resizable: true },
			position: { left: 115, top: 60, width: 400, height: 200 },
			rootComponent: editSectorVue,
		}
	}

	async _getVueData(): Promise<object> {
		return { sceneId: this.sceneId }
	}
}
