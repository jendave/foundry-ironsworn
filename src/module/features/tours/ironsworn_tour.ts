// Make Typescript happy with tour extensions
declare global {
	interface TourStep {
		sidebarTab?: string
		layer?: string
		tool?: string
		hook?: () => Promise<unknown> | unknown
	}
}

export class IronswornTour extends foundry.nue.Tour {
	/** @override */
	async start(): Promise<void> {
		const active = (foundry.nue.Tour as any).activeTour
		if (active && active !== this) await active.reset()
		return super.start()
	}

	/** @override */
	protected async _postStep(): Promise<void> {
		// Skip deactivation when there was no real prior step (e.g. starting from UNSTARTED).
		// The extra transitionend listener from deactivate() interferes with the first tooltip.
		if (this.currentStep == null && this.targetElement == null) return
		return super._postStep()
	}

	/** @override */
	protected async _preStep(): Promise<void> {
		await super._preStep()

		if (this.currentStep?.sidebarTab) {
			;(ui.sidebar as any)?.changeTab(this.currentStep.sidebarTab, 'primary')
		}

		if (this.currentStep?.layer) {
			const layer = canvas?.[this.currentStep.layer]
			if (layer.active && this.currentStep.tool)
				ui.controls?.initialize({ tool: this.currentStep.tool })
			else layer.activate({ tool: this.currentStep.tool })
		}

		if (this.currentStep?.hook != null) {
			await this.currentStep.hook()
		}
	}
}
