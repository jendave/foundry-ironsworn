import { COMPENDIUM_KEY_MAP, DataswornTree } from '../datasworn2'
import { DataswornRulesetKey } from '../helpers/settings'
import { IronswornJournalEntry } from '../journal/journal-entry'
import sfTruthsVue from '../vue/sf-truths.vue'
import { VueAppMixin } from '../vue/vueapp.js'

const { ApplicationV2 } = foundry.applications.api

export class SFSettingTruthsDialogVue extends VueAppMixin(ApplicationV2) {
	constructor(protected truthset: DataswornRulesetKey) {
		super({})
	}

	static DEFAULT_OPTIONS = {
		id: 'setting-truths-dialog',
		classes: ['ironsworn', 'sheet'],
		window: {
			title: 'IRONSWORN.JOURNALENTRYPAGES.TypeTruth',
			resizable: true,
		},
		position: { width: 700, height: 700 },
		rootComponent: sfTruthsVue,
	}

	async _getVueData(): Promise<object> {
		const pack = game.packs.get(COMPENDIUM_KEY_MAP.truth[this.truthset])
		const documents = (await pack?.getDocuments()) as IronswornJournalEntry[]
		if (!documents) throw new Error("can't load truth JEs")

		const dsTruths = DataswornTree.get(this.truthset)?.truths
		if (!dsTruths) throw new Error("can't find DS truths")

		const truths = Object.values(dsTruths).map((ds) => ({
			ds,
			je: documents.find(
				(x) => x.getFlag('foundry-ironsworn', 'dsid') === ds._id
			)
		}))

		return {
			truths: truths.map(({ ds, je }) => ({
				ds,
				je: () => je // Prevent vue from wrapping this in Reactive
			}))
		}
	}
}
