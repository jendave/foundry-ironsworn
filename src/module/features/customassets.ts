import type { Datasworn } from '@datasworn-community/core'
type Asset = Datasworn.Asset
type AssetCollection = Datasworn.AssetCollection
import { compact } from 'lodash-es'
import {
	DataswornTree,
	FoundryIndex,
	getPackAndIndexForCompendiumKey
} from '../datasworn2'
import { IronswornSettings } from '../helpers/settings'
import type { IronswornItem } from '../item/item'

interface DisplayAsset {
	ds?: Asset
	uuid?: string
	assetFetcher: () => Promise<IronswornItem>
}

interface DisplayAssetCategory {
	ds?: AssetCollection
	title: string
	description?: string
	expanded: boolean
	assets: DisplayAsset[]
}

interface DisplayAsssetRuleset {
	title: string
	categories: DisplayAssetCategory[]
}

function makeAssetEntry(
	dsid: string,
	pack: CompendiumCollection<CompendiumCollection.Metadata>,
	index: FoundryIndex
): { uuid: string; assetFetcher: () => Promise<IronswornItem> } | undefined {
	const indexEntry = index.contents.find(
		(x) => x.flags?.['foundry-ironsworn']?.dsid === dsid
	)
	if (!indexEntry) return undefined
	return {
		uuid: indexEntry.uuid as string,
		assetFetcher: async () => (await pack.getDocument(indexEntry._id)) as IronswornItem
	}
}

export async function createMergedAssetTree(): Promise<DisplayAsssetRuleset[]> {
	let ret: DisplayAsssetRuleset[] = compact(
		await Promise.all(
			IronswornSettings.enabledRulesets.map(async (rsKey) => {
				const rs = DataswornTree.get(rsKey)
				if (!rs) return undefined

				const rsTitle = rsKey.titleCase()
				const i18n = (categoryName: string, subKey: string) => {
					const capCat = categoryName.titleCase()
					return game.i18n.localize(
						`IRONSWORN.Asset Categories.${rsTitle}.${capCat}.${subKey}`
					)
				}

				const { pack, index } = await getPackAndIndexForCompendiumKey(rsKey, 'asset')
				if (!pack || !index) return undefined

				return {
					title: game.i18n.localize(`IRONSWORN.RULESETS.${rsKey}`),
					categories: Object.values(rs.assets).map((cat) => {
						return {
							ds: cat,
							title: i18n(cat.name, 'Title'),
							description: i18n(cat.name, 'Description'),
							expanded: false,
							assets: Object.values(cat.contents).flatMap((asset) => {
								const entry = makeAssetEntry(asset._id, pack, index)
								if (!entry) return []
								return [{ ds: asset, ...entry }]
							})
						}
					})
				}
			})
		)
	)

	// Remove rulesets with no assets
	ret = ret.filter((rs) => rs.categories.length > 0)

	// Add custom assets from well-known folder
	const customAssets = await customAssetFolderContents()
	if (customAssets)
		ret.push({
			title: game.i18n.localize('IRONSWORN.Asset Categories.Custom'),
			categories: [customAssets]
		})

	// fire the hook and allow extensions to modify the list
	for (const rs of ret) {
		Hooks.call('ironswornAssets', rs)
	}

	return ret
}

async function customAssetFolderContents(): Promise<
	DisplayAssetCategory | undefined
> {
	const name = game.i18n.localize('IRONSWORN.Asset Categories.Custom')
	const folder = (game.items as any)?.folders.find((x) => x.name === name) as
		| Folder
		| undefined
	if (folder == null || folder.contents.length === 0) return

	const customAssets = [] as DisplayAsset[]
	for (const item of folder.contents) {
		if (item.documentName !== 'Item' || item.type !== 'asset') continue
		customAssets.push({ assetFetcher: async () => item })
	}

	return {
		title: name,
		expanded: false,
		assets: customAssets
	}
}
