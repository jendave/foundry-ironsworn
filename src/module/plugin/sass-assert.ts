import type { InterpolationMode } from 'chroma-js'
import type { Value } from 'sass'

const COLOR_MODES: InterpolationMode[] = [
	'rgb',
	'hsl',
	'hsv',
	'hsi',
	'lab',
	'lch',
	'hcl',
	'lrgb',
	'oklab',
	'oklch'
]

// HELPER FUNCTIONS: TYPECHECK SASS VALUES

export function assertColor(obj: Value) {
	return obj.assertColor()
}
export function assertNumber(obj: Value) {
	return obj.assertNumber()
}
export function assertList(obj: Value) {
	// Every Sass value can be used as a list (see `Value.asList`), so there's
	// nothing to assert here — this just documents intent at call sites.
	return obj
}
export function assertString(obj: Value) {
	return obj.assertString()
}
export function assertMode(obj: Value): string {
	const mode = assertString(obj).text
	if (!COLOR_MODES.includes(mode as InterpolationMode)) {
		throw new Error(
			`Expected a chroma.js color interpolation mode, received: ${mode}`
		)
	}
	return mode
}
export function assertModeChannel(obj: Value): string {
	const value = assertString(obj).text
	const [mode, chan] = value.split('.')

	if (
		// invalid color mode
		!COLOR_MODES.includes(mode as InterpolationMode) ||
		// invalid color channel for mode. 'a' (alpha channel) is always valid
		(chan !== 'a' && !mode.includes(chan))
	) {
		throw new Error(
			`Expected a chroma.js color interpolation mode and channel, received: ${value}`
		)
	}
	return value
}
