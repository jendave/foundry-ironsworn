import shajs from 'sha.js'

// Import a local copy of the legacy ID maps
export const LegacyToDataswornIds: Record<string, string> = {
	...require('./legacy_ids/classic/assets.json'),
	...require('./legacy_ids/classic/moves.json'),
	...require('./legacy_ids/classic/npcs.json'),
	...require('./legacy_ids/classic/oracles.json'),
	...require('./legacy_ids/starforged/assets.json'),
	...require('./legacy_ids/starforged/moves.json'),
	...require('./legacy_ids/starforged/oracles.json'),
	...require('./legacy_ids/starforged/npcs.json'),
	...require('./legacy_ids/starforged/truths.json')
}
export const DataswornToLegacyIds: Record<string, string> = Object.fromEntries(
	Object.entries(LegacyToDataswornIds).map(([k, v]) => [v, k])
)
export const lookupLegacyId = (dsid: string): string => {
	const legacyId = DataswornToLegacyIds[dsid]
	if (
		!legacyId &&
		!dsid.includes('sundered_isles') &&
		!dsid.includes('oracle_rollable.row:') &&
		!dsid.includes('truth:classic') &&
		!dsid.startsWith('delve_site')
	) {
		console.log('!!! No legacy ID for', dsid)
	}
	return legacyId ?? dsid
}

export function hash(str: string): string {
	return shajs('sha256').update(str).digest('hex').substring(48)
}
