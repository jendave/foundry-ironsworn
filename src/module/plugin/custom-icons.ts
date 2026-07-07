import { readdirSync } from 'fs'
import path from 'path'

import type { CustomFunction } from 'sass'
import { SassString } from 'sass'
import { assertString } from './sass-assert'
import { map2SassMap } from './sass-convert'

export const ICON_DIRS = [
	path.resolve(process.cwd(), 'system/assets/icons'),
	path.resolve(process.cwd(), 'system/assets/misc')
]

function loadIcons(dirString: string) {
	const filePath = path.resolve(process.cwd(), dirString)
	const files = readdirSync(filePath).filter((file) => file.endsWith('.svg'))
	return files
}

const plugin: Record<string, CustomFunction<'sync'>> = {
	'getIconVars($dir, $prefix)': ([dir, prefix]) => {
		const dirString = assertString(dir).text || 'system/assets/icons'
		const prefixValue = assertString(prefix).text || 'isicon'
		const files = loadIcons(dirString)
		const map = new Map(
			files.map((file) => [
				`--${prefixValue}-${path.basename(file, '.svg')}`,
				file
			])
		)
		return map2SassMap(map, (key, value) => ({
			key: new SassString(key),
			value: new SassString(value)
		}))
	},
	'getIconClasses($dir, $prefix)': ([dir, prefix]) => {
		const dirString = assertString(dir).text || 'system/assets/icons'
		const prefixValue = assertString(prefix).text || 'isicon'
		const files = loadIcons(dirString)
		const map = new Map(
			files.map((file) => [
				`.${prefixValue}-${path.basename(
					file,
					'.svg'
				)}, .${prefixValue}bg-${path.basename(file, '.svg')}`,
				`--${prefixValue}-${path.basename(file, '.svg')}`
			])
		)
		return map2SassMap(map, (key, value) => ({
			key: new SassString(key),
			value: new SassString(value)
		}))
	}
}

export default plugin
