// based on https://github.com/bugsnag/chromatic-sass

import Chroma from 'chroma-js'
import { last, maxBy, minBy } from 'lodash-es'

import type { CustomFunction } from 'sass'
import { SassColor, SassNumber, SassString } from 'sass'
import {
	assertColor,
	assertModeChannel as assertColorModeChannel,
	assertNumber,
	assertString,
	assertMode as assertColorMode,
	assertList
} from './sass-assert'
import {
	sass2Chroma,
	chroma2Sass,
	sassList2Array,
	map2SassMap,
	array2SassList
} from './sass-convert'
import { gamutize } from './gamutize'

/**
 * A SASS plugin that partially implements the `chroma.js` color manipulation library.
 * @see {@link Chroma}
 */
const plugin: Record<string, CustomFunction<'sync'>> = {
	/**
	 * @see {@link Chroma.Color.set}
	 */
	'setChannel($color, $modechan, $value)': ([color, modechan, value]) => {
		const newColor = sass2Chroma(assertColor(color)).set(
			assertColorModeChannel(modechan),
			assertNumber(value).value
		)
		return chroma2Sass(newColor)
	},
	/**
	 * @see {@link Chroma.Color.get}
	 */
	'getChannel($color, $modechan)': ([color, modechan]) => {
		const chromaColor = sass2Chroma(assertColor(color))
		return new SassNumber(
			chromaColor.get(assertColorModeChannel(modechan))
		)
	},
	/**
	 * @see {@link Chroma.Color.luminance}
	 */
	"luminance($color, $luminance: null, $color-space: 'rgb')": ([
		color,
		luminance,
		mode
	]) => {
		const chromaColor = sass2Chroma(assertColor(color))
		const colorMode = assertColorMode(mode)

		if (luminance.realNull === null) {
			// return the colour's luminance
			return new SassNumber(chromaColor.luminance())
		} else {
			// set the colour's luminance and return the new color.
			// Use the unclipped rgba components (rather than chroma2Sass's
			// .rgba(), which clamps) so out-of-gamut results round-trip intact.
			const [red, green, blue, alpha] = chromaColor.luminance(
				assertNumber(luminance).value,
				colorMode as Chroma.InterpolationMode
			)._rgb._unclipped
			return new SassColor({ red, green, blue, alpha })
		}
	},

	'lightest($colors...)': ([colors]) => {
		const arr = sassList2Array(assertList(colors), (v) =>
			sass2Chroma(assertColor(v))
		)
		return chroma2Sass(maxBy(arr, (color) => color.luminance())!)
	},

	'darkest($colors...)': ([colors]) => {
		const arr = sassList2Array(assertList(colors), (v) =>
			sass2Chroma(assertColor(v))
		)
		return chroma2Sass(minBy(arr, (color) => color.luminance())!)
	},
	/**
	 * @see {@link Chroma.contrast}
	 */
	'contrast($color1, $color2)': ([color1, color2]) => {
		const [chromaColor1, chromaColor2] = [color1, color2].map((c) =>
			sass2Chroma(assertColor(c))
		)
		const contrastValue = Chroma.contrast(chromaColor1, chromaColor2)
		return new SassNumber(contrastValue)
	},

	"mix($color1, $color2, $f: 0.5, $color-space: 'lrgb')": ([
		color1,
		color2,
		f,
		colorSpace
	]) => {
		const fValue = assertNumber(f).value
		const mode = assertColorMode(colorSpace)
		const [chromaColor1, chromaColor2] = [color1, color2].map((c) =>
			sass2Chroma(assertColor(c))
		)
		const newColor = Chroma.mix(
			chromaColor1,
			chromaColor2,
			fValue,
			mode as Chroma.InterpolationMode
		)
		return chroma2Sass(newColor)
	},

	/**
	 * @see {@link Chroma.Color.hcl}
	 */
	'hcl($h, $c, $l)': ([h, c, l]) => {
		const [hValue, cValue, lValue] = [h, c, l].map(
			(channel) => assertNumber(channel).value
		)
		const chromaColor = Chroma([hValue, cValue, lValue], 'hcl')
		return chroma2Sass(chromaColor)
	},
	/**
	 * @see {@link Chroma.Color.lch}
	 */
	'lch($l,$c,$h)': ([l, c, h]) => {
		const [lValue, cValue, hValue] = [l, c, h].map(
			(channel) => assertNumber(channel).value
		)
		const chromaColor = Chroma([lValue, cValue, hValue], 'lch')
		return chroma2Sass(chromaColor)
	},

	/**
	 * @see {@link Chroma.Color.oklch}
	 */
	'oklch($l,$c,$h)': ([l, c, h]) => {
		const [lValue, cValue, hValue] = [l, c, h].map(
			(channel) => assertNumber(channel).value
		)
		const chromaColor = Chroma(lValue, cValue, hValue, 'oklch')
		return chroma2Sass(chromaColor)
	},

	"scaleSteps($colors, $steps, $mode: 'lrgb')": ([colors, steps, mode]) => {
		const stepsValue = assertNumber(steps).value
		const modeValue = assertColorMode(mode)

		const chromaColors = sassList2Array(assertList(colors), (v) =>
			sass2Chroma(assertColor(v))
		)
		const scale = Chroma.scale(chromaColors)
			.correctLightness(true)
			.classes(stepsValue)
			.mode(modeValue as Chroma.InterpolationMode)
			.colors(stepsValue, null)

		return array2SassList(scale, (v) => chroma2Sass(v as any))
	},
	/**
	 * Interpolates a palette of colors from four 'anchor' colors.
	 *
	 * Currently it doesn't check contrast, but it probably should.
	 *
	 * @remarks 'warm' and 'cool' are used here primarily because they're more memorable labels than 'primary' or 'secondary'. They *could* be 'warmer'/'cooler' colours, but they don't have to be; 'warm'/'cool' are more about a UX element's importance/activity (warmer = more active/dramatic).
	 */
	"gamutize($fg-color, $bg-color, $warm-color, $cool-color, $prefix: 'palette')":
		([fgColor, bgColor, warmColor, coolColor, prefix]) => {
			const prefixValue = assertString(prefix).text

			// establish the how the dark and light colours will be mapped to the foreground and background colours
			const ground = {
				fg: sass2Chroma(assertColor(fgColor)),
				bg: sass2Chroma(assertColor(bgColor))
			}
			const lightness = {
				light: maxBy([ground.fg, ground.bg], (color) =>
					color?.luminance()
				) as Chroma.Color,
				dark: minBy([ground.fg, ground.bg], (color) =>
					color?.luminance()
				) as Chroma.Color
			}
			const isDarkTheme = ground.fg.luminance() > ground.bg.luminance()

			const darkGround = isDarkTheme ? 'bg' : 'fg'
			const lightGround = isDarkTheme ? 'fg' : 'bg'

			const temperature = {
				warm: sass2Chroma(assertColor(warmColor)),
				cool: sass2Chroma(assertColor(coolColor))
			}

			// setup complete! now generate the colour map
			const colors = gamutize(
				lightness.light,
				lightness.dark,
				temperature.warm,
				temperature.cool
			)

			// assign the map's light and dark colours to foreground and background
			colors.forEach((colorValue, colorKey) => {
				switch (true) {
					case colorKey.includes('light'):
						colors.set(colorKey.replace('light', lightGround), colorValue)
						break
					case colorKey.includes('dark'):
						colors.set(colorKey.replace('dark', darkGround), colorValue)
						break

					case colorKey.includes('scale') && isDarkTheme:
						colors.set(colorKey.replace('scale', 'midtone'), colorValue)
						break
					case colorKey.includes('scale'):
						{
							const oldScaleValueSubstring = last(colorKey.split('-'))
							if (!oldScaleValueSubstring)
								throw new Error(
									`Could not parse the last substring of ${colorKey}`
								)
							const oldScaleValue = parseInt(oldScaleValueSubstring)
							if (isNaN(oldScaleValue))
								throw new Error(
									`Could not parse a number from the last substring of ${colorKey}`
								)
							const newMidtoneValue = 100 - oldScaleValue
							colors.set(`midtone-${newMidtoneValue}`, colorValue)
						}
						break
					default:
						break
				}
			})

			const sassColors = map2SassMap(colors, (colorKey, colorValue) => ({
				key: new SassString(`${prefixValue}-${colorKey}`),
				value: chroma2Sass(colorValue)
			}))

			return sassColors
		}
}

export default plugin
