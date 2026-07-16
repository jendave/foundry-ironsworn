import Chroma from 'chroma-js'
import { List, OrderedMap } from 'immutable'
import { SassColor, SassList, SassMap, Value } from 'sass'

/**
 * Converts a Sass list-like {@link Value} to a standard {@link Array}.
 */
export function sassList2Array<V>(
	list: Value,
	converter: (value: Value) => V
) {
	return list.asList.map(converter).toArray()
}

/**
 * Converts a standard {@link Array} to a {@link SassList}.
 * @param converter - A function used to convert each value in the original Array.
 */
export function array2SassList<V>(array: V[], converter: (value: V) => Value) {
	return new SassList(List(array.map(converter)))
}

/**
 * Converts a standard {@link Map} to a {@link SassMap}.
 * @param map - The standard JS Map to be converted.
 * @param converter - A function used to convert each key/value pair in the original Map.
 */
export function map2SassMap<K, V>(
	map: Map<K, V>,
	converter: (key: K, value: V) => { key: Value; value: Value }
) {
	let contents = OrderedMap<Value, Value>()
	map.forEach((oldValue, oldKey) => {
		const { key, value } = converter(oldKey, oldValue)
		contents = contents.set(key, value)
	})
	return new SassMap(contents)
}

/**
 * Converts a {@link Chroma.Color} to a {@link SassColor}.
 */
export function chroma2Sass(color: Chroma.Color) {
	const [red, green, blue, alpha] = color.rgba()
	return new SassColor({ red, green, blue, alpha })
}
/**
 * Converts a {@link SassColor} to a {@link Chroma.Color}.
 *
 * Sass's modern API returns exact (potentially fractional) RGB channel
 * values, unlike the legacy API's pre-rounded `getR()`/`getG()`/`getB()`.
 * Round here so downstream color math matches prior output.
 */
export function sass2Chroma(color: SassColor) {
	const rgb = color.toSpace('rgb')
	return Chroma.rgb(
		Math.round(rgb.channel('red', { space: 'rgb' })),
		Math.round(rgb.channel('green', { space: 'rgb' })),
		Math.round(rgb.channel('blue', { space: 'rgb' })),
		rgb.alpha
	)
}
