import type { App } from 'vue'
import { $ItemKey } from './provisions'
import { VueAppMixin } from './vueapp.js'

export abstract class VueItemSheet extends VueAppMixin(
	foundry.applications.sheets.ItemSheetV2 as any
) {
	static DEFAULT_OPTIONS = {
		classes: ['ironsworn', 'item'],
		position: { width: 520, height: 480 },
		window: {
			controls: [
				{
					action: 'toggleEditMode',
					icon: 'fas fa-edit',
					label: 'IRONSWORN.Edit',
				},
			],
		},
		actions: {
			async toggleEditMode(this: VueItemSheet) {
				if (!this.hasEditMode) return
				const currentValue = this.item.getFlag(
					'foundry-ironsworn',
					'edit-mode'
				)
				try {
					await this.item.setFlag('foundry-ironsworn', 'edit-mode', !currentValue)
				} catch (err) {
					console.error(err)
					await foundry.applications.api.DialogV2.alert({
						window: { title: game.i18n.localize('IRONSWORN.Error') },
						content: game.i18n.localize('IRONSWORN.LockedCompendiumEditError'),
					})
				}
			},
		},
	}

	readonly hasEditMode: boolean = true

	setupVueApp(app: App) {
		app.provide($ItemKey, this.item)
	}

	async _getVueData(): Promise<object> {
		return {
			item: this.item.toObject(),
		}
	}

	_getHeaderControls() {
		const controls = super._getHeaderControls()
		const compendium = (this.item as any).compendium
		const lockedCompendium = compendium != null && compendium.locked
		if (!this.hasEditMode || lockedCompendium) {
			return controls.filter(
				(c: any) => c.action !== 'toggleEditMode'
			)
		}
		return controls
	}
}
