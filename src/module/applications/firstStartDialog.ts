import { Expansion } from '@datasworn/core/dist/Datasworn'
import { DataswornTree } from '../datasworn2'
import { registerDefaultOracleTrees } from '../features/customoracles'
import { IronswornSettings, RULESETS } from '../helpers/settings'
import { SFSettingTruthsDialogVue } from './vueSfSettingTruthsDialog'
import { IronswornCharacterSheetV2 } from '../actor/sheets/charactersheet-v2'
import { StarforgedCharacterSheet } from '../actor/sheets/sf-charactersheet'

function getSheetId(sheetClass: new (...args: any[]) => any): string | undefined {
	const sheets = (CONFIG as any).Actor?.sheetClasses?.character ?? {}
	return Object.values(sheets).find((s: any) => s.cls === sheetClass)?.id as string | undefined
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class FirstStartDialog extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: 'first-start-dialog',
		classes: ['ironsworn', 'sheet', 'first-start'],
		position: { width: 650, height: 780 },
		window: {
			title: 'IRONSWORN.First Start.Welcome',
			resizable: true,
		},
	}

	static PARTS = {
		form: {
			template: 'systems/foundry-ironsworn/templates/first-start.hbs',
		},
	}

	async _prepareContext(_options?: object): Promise<object> {
		const rulesets: Record<string, object> = {}
		for (const r of RULESETS) {
			const dsRuleset = DataswornTree.get(r) as Expansion
			rulesets[r] = {
				id: r,
				requires: dsRuleset?.ruleset,
				name: game.i18n.localize(`IRONSWORN.RULESETS.${r}`),
				enabled: IronswornSettings.get(`ruleset-${r}`),
			}
		}
		return {
			rulesets,
			sheetIsIronsworn: this.currentDefaultSheet === 'ironsworn',
			sheetIsStarforged: this.currentDefaultSheet === 'starforged',
		}
	}

	_onRender(_context: object, _options: object): void {
		const element = this.element as HTMLElement

		// Auto-check required rulesets
		element.querySelectorAll<HTMLInputElement>('input.ruleset').forEach((input) => {
			input.addEventListener('change', () => {
				if (input.checked) {
					const required = input.dataset.requires
					if (required) {
						element.querySelector<HTMLInputElement>(
							`input.ruleset[value="${required}"]`
						)!.checked = true
					}
				} else {
					element
						.querySelectorAll<HTMLInputElement>(
							`input.ruleset[data-requires="${input.value}"]`
						)
						.forEach((dep) => (dep.checked = false))
				}
			})
		})

		element
			.querySelector('button.ironsworn__save')
			?.addEventListener('click', async () => {
				// Update default character sheet
				const defaultSheet = (
					element.querySelector<HTMLInputElement>('input[name=sheet]:checked')
				)?.value
				if (defaultSheet) {
					const sheetClassMap: Record<string, new (...args: any[]) => any> = {
						IronswornCharacterSheetV2,
						StarforgedCharacterSheet,
					}
					const sheetId = sheetClassMap[defaultSheet]
						? getSheetId(sheetClassMap[defaultSheet])
						: undefined
					if (sheetId) {
						const setting = game.settings.get('core', 'sheetClasses')
						foundry.utils.mergeObject(setting, { 'Actor.character': sheetId })
						await game.settings.set('core', 'sheetClasses', setting)
					}
				}

				// Update rulesets
				const checkedRulesets = Array.from(
					element.querySelectorAll<HTMLInputElement>('input.ruleset:checked')
				).map((x) => x.value ?? '')
				await IronswornSettings.enableOnlyRulesets(...checkedRulesets)

				// If you chose SI, probably you want 'hold' enabled
				await IronswornSettings.set(
					'character-hold',
					checkedRulesets.includes('sundered_isles')
				)

				// Update the live content
				void registerDefaultOracleTrees()

				// Launch truths dialog
				const truthsFlavor = (
					element.querySelector<HTMLInputElement>('input[name=truths]:checked')
				)?.value
				if (truthsFlavor) {
					// @ts-expect-error coercing this string to a DataswornRulesetKey
					void new SFSettingTruthsDialogVue(truthsFlavor).render({ force: true })
				}

				await IronswornSettings.set('show-first-start-dialog', false)
				await (this as any).close()
			})
	}

	get currentDefaultSheet(): 'ironsworn' | 'starforged' {
		const setting = game.settings.get('core', 'sheetClasses')
		if (setting.Actor?.character === getSheetId(StarforgedCharacterSheet)) {
			return 'starforged'
		}
		return 'ironsworn'
	}

	static async maybeShow() {
		if (!IronswornSettings.get('show-first-start-dialog')) {
			return
		}
		await new FirstStartDialog().render({ force: true })
	}
}
