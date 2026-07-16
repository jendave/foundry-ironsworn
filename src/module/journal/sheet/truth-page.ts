import { IronswornHandlebarsHelpers } from '../../helpers/handlebars'

const { JournalEntryPageHandlebarsSheet } = foundry.applications.sheets.journal

export class TruthJournalPageSheet extends JournalEntryPageHandlebarsSheet {
	static EDIT_PARTS = {
		header: (JournalEntryPageHandlebarsSheet as any).EDIT_PARTS.header,
		content: {
			template:
				'systems/foundry-ironsworn/templates/journal/page-truth-edit.hbs'
		},
		footer: (JournalEntryPageHandlebarsSheet as any).EDIT_PARTS.footer
	}

	static VIEW_PARTS = {
		content: {
			template:
				'systems/foundry-ironsworn/templates/journal/page-truth-view.hbs',
			root: true
		}
	}

	async _prepareContentContext(context: any, _options: object): Promise<void> {
		context.system = this.page.system
		context.renderedDescription =
			await IronswornHandlebarsHelpers.enrichMarkdown(this.page.system.Description)
	}
}
