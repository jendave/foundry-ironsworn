import ChallengeResolutionDialogVue from '../vue/challenge-resolution-dialog.vue'
import { VueAppMixin } from '../vue/vueapp.js'

const { ApplicationV2 } = foundry.applications.api

export class ChallengeResolutionDialog extends VueAppMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		window: { title: 'IRONSWORN.ResolveChallenge' },
		position: { width: 300, height: 280 },
		rootComponent: ChallengeResolutionDialogVue,
	}

	static openDialogs = {} as Record<string, ChallengeResolutionDialog>

	private constructor(protected messageId: string, options?: object) {
		super(options ?? {})
	}

	static async showForMessage(messageId: string) {
		if (this.openDialogs[messageId]) {
			return void this.openDialogs[messageId].render({ force: true })
		}

		const el = document.querySelector(`.chat-message[data-message-id="${messageId}"]`)
		if (!el) return

		const rect = (el as HTMLElement).getBoundingClientRect()
		this.openDialogs[messageId] = new ChallengeResolutionDialog(messageId, {
			position: {
				left: window.innerWidth - 620,
				top: Math.min(rect.top - 50, window.innerHeight - 300),
			},
		})
		void this.openDialogs[messageId].render({ force: true })
		return this.openDialogs[messageId]
	}

	async _getVueData(): Promise<object> {
		return { messageId: this.messageId }
	}

	_onClose(options: object): void {
		delete ChallengeResolutionDialog.openDialogs[this.messageId]
		super._onClose(options)
	}
}
