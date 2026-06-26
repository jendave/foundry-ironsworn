import type { App } from 'vue'
import type { IronswornItem } from '../item/item'
import { $ActorKey } from './provisions'
import { VueAppMixin } from './vueapp.js'

export abstract class VueActorSheet extends VueAppMixin(
	foundry.applications.sheets.ActorSheetV2 as any
) {
	static DEFAULT_OPTIONS = {
		classes: ['ironsworn', 'actor'],
		window: {
			resizable: true,
			controls: [
				{
					action: 'toggleEditMode',
					icon: 'fas fa-edit',
					label: 'IRONSWORN.Edit',
				},
			],
		},
		actions: {
			toggleEditMode(this: VueActorSheet) {
				const currentValue = this.actor.getFlag(
					'foundry-ironsworn',
					'edit-mode'
				)
				void this.actor.setFlag('foundry-ironsworn', 'edit-mode', !currentValue)
			},
		},
	}

	setupVueApp(app: App) {
		app.provide($ActorKey, this.actor)
	}

	async _getVueData(): Promise<object> {
		return {
			actor: this.actor.toObject(),
		}
	}

	async _onClose(options: object) {
		await this.actor.moveSheet?.close()
		super._onClose(options)
	}

	protected async _onDrop(event: DragEvent) {
		const data = (
			foundry.applications.ux.TextEditor.implementation as any
		).getDragEventData(event)

		if (['AssetBrowserData', 'FoeBrowserData'].includes(data.type)) {
			const document = (await fromUuid(data.uuid)) as
				| StoredDocument<IronswornItem>
				| undefined

			if (document != null) {
				void this.actor.createEmbeddedDocuments('Item', [
					(document as any).toObject(),
				])
			}
		}

		super._onDrop(event)
	}
}
