const MOON_EMOJI = [
	'', // 0, not used for die results
	'🌑', // 1 new
	'🌒', // 2
	'🌒', // 3
	'🌒', // 4
	'🌓', // 5
	'🌓', // 6
	'🌔', // 7
	'🌔', // 8
	'🌔', // 9
	'🌕' // 10 full
]

export async function createSiMoonsChatMessage(cinder: Roll, wraith: Roll) {
	// TODO: resolve which one is higher, matches, etc.
	const params = {
		cinder,
		cinderEmoji: MOON_EMOJI[cinder.total ?? 1],
		wraith,
		wraithEmoji: MOON_EMOJI[wraith.total ?? 1]
	}
	const content = await foundry.applications.handlebars.renderTemplate(
		'systems/foundry-ironsworn/templates/rolls/si-moons-roll-message.hbs',
		params
	)
	await ChatMessage.create({
		speaker: ChatMessage.getSpeaker(),
		content,
		style: CONST.CHAT_MESSAGE_STYLES.OTHER,
		rolls: [cinder, wraith]
	})
}
