import { fill, range } from 'lodash-es'
import { RANK_INCREMENTS } from '../../constants'
import { ChallengeRank } from '../../fields/ChallengeRank'
import { IronswornPrerollDialog } from '../../rolls'

const { JournalEntryPageHandlebarsSheet } = foundry.applications.sheets.journal

export class JournalProgressPageSheet extends JournalEntryPageHandlebarsSheet {
	static DEFAULT_OPTIONS = {
		classes: ['progress', 'ironsworn'],
		position: { height: 300 },
		actions: {
			markProgress: JournalProgressPageSheet.markProgress,
			unmarkProgress: JournalProgressPageSheet.unmarkProgress,
			rollProgress: JournalProgressPageSheet.rollProgress,
			setRank: JournalProgressPageSheet.setRank
		}
	}

	static EDIT_PARTS = {
		header: (JournalEntryPageHandlebarsSheet as any).EDIT_PARTS.header,
		content: {
			template:
				'systems/foundry-ironsworn/templates/journal/progress-page-edit.hbs'
		},
		footer: (JournalEntryPageHandlebarsSheet as any).EDIT_PARTS.footer
	}

	static VIEW_PARTS = {
		content: {
			template:
				'systems/foundry-ironsworn/templates/journal/progress-page-view.hbs',
			root: true
		}
	}

	async _prepareContentContext(context: any, _options: object): Promise<void> {
		const system = this.page.system

		context.currentRank = ChallengeRank.localizeValue(
			system.rank ?? ChallengeRank.RANK.Troublesome
		)
		context.rankButtons = Object.values(ChallengeRank.RANK).map((rank) => ({
			rank,
			i18nRank: ChallengeRank.localizeValue(rank),
			selected: system.rank === rank
		}))

		// Compute some progress numbers
		const boxes = range(10).map((_) => ({
			ticks: 0,
			lineTransforms: [] as string[]
		}))
		const ticksRemainder = system.ticks % 4
		context.filledBoxes = Math.floor(system.ticks / 4)

		fill(boxes, { ticks: 4, lineTransforms: [] }, 0, context.filledBoxes)
		boxes[context.filledBoxes] = { ticks: ticksRemainder, lineTransforms: [] }

		// List of line transforms
		const transforms = [
			'rotate(-45, 50, 50)',
			'rotate(45, 50, 50)',
			'rotate(-90, 50, 50)',
			''
		]
		for (const box of boxes) {
			if (box.ticks > 0) box.lineTransforms.push(transforms[0])
			if (box.ticks > 1) box.lineTransforms.push(transforms[1])
			if (box.ticks > 2) box.lineTransforms.push(transforms[2])
			if (box.ticks > 3) box.lineTransforms.push(transforms[3])
		}
		context.boxes = boxes
		context.system = system
	}

	static async setRank(this: any, _event: PointerEvent, target: HTMLElement) {
		await this.page.update({
			system: { rank: parseInt(target.dataset.rank ?? '0') }
		})
	}

	static async markProgress(this: any) {
		await increment(this.page, 1)
	}

	static async unmarkProgress(this: any) {
		await increment(this.page, -1)
	}

	static rollProgress(this: any) {
		const filledBoxes = Math.floor((this.page.system.ticks ?? 0) / 4)
		IronswornPrerollDialog.showForProgress(
			this.page.name ?? '(progress)',
			filledBoxes
		)
	}
}

function increment(page: any, direction: 1 | -1) {
	const rank: ChallengeRank.Value =
		page.system.rank ?? ChallengeRank.RANK.Troublesome
	const incrementBy = RANK_INCREMENTS[rank]
	const currentValue = page.system.ticks || 0
	const newValue = currentValue + incrementBy * direction
	return page.update({
		system: { ticks: Math.min(Math.max(newValue, 0), 40) }
	})
}
