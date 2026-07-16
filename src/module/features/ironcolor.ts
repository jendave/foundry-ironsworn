import { kebabCase } from 'lodash-es'
import { IronswornSettings } from '../helpers/settings'
import * as IronTheme from './irontheme'

import '../../styles/styles.less'
import '../../styles/_irontheme.scss'
import '../../styles/_ironcolor/zinc.scss'
import '../../styles/_ironcolor/phosphor.scss'
import '../../styles/_ironcolor/oceanic.scss'

export const PREFIX = 'ironcolor__'

const THEME_COLOR_MAP: Record<string, string> = {
	ironsworn: 'zinc',
	starforged: 'phosphor',
	sunderedisles: 'oceanic',
}

export function colorSchemeSetup() {
	// Mark the body with the Foundry generation so CSS can target v13 vs v14.
	document.body.classList.add(`foundry-v${game.release.generation}`)

	// Sync the color scheme to match the world theme so that changing "Theme"
	// (which requires reload) also changes the color palette.
	const theme = IronswornSettings.get('theme')
	const colorForTheme = THEME_COLOR_MAP[theme] as
		| ClientSettings.Values['foundry-ironsworn.color-scheme']
		| undefined
	const colorScheme = colorForTheme ?? IronswornSettings.get('color-scheme')

	document.body.classList.add(`${IronTheme.PREFIX}${kebabCase(theme)}`)
	document.body.classList.add(`${PREFIX}${colorScheme}`)
}

/**
 * Instantly updates the client's color scheme without reloading.
 */
export function updateColorScheme(
	newColorScheme: ClientSettings.Values['foundry-ironsworn.color-scheme']
) {
	const colorSchemes = Object.keys(
		game.settings.settings.get('foundry-ironsworn.color-scheme')
			?.choices as unknown as Record<string, unknown>
	)

	const classesToRemove = colorSchemes.map((str) => `${PREFIX}${str}`)

	const toUpdate: HTMLElement[] = [document.body]

	// FVTT module: PopOut!
	if (game.modules.get('popout')?.active != null) {
		// @ts-expect-error
		const PopOut = PopoutModule.singleton as any
		const popOuts = PopOut.poppedOut as Map<string, { window: Window | null }>

		for (const [, { window }] of popOuts) {
			if (window?.document != null) {
				toUpdate.push(window.document?.body)
			}
		}
	}
	for (const el of toUpdate) {
		for (const cls of classesToRemove) el.classList.remove(cls)
		el.classList.add(`${PREFIX}${newColorScheme}`)
	}
}
