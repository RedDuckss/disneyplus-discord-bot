const Discord = require('discord.js');

async function search(query, disneyClient, message) {
	const searchResults = await disneyClient.search(query);

	const embed = new Discord.MessageEmbed()
		.setColor(0x113CCF)
		.setTitle(`Search results for "${query}"`)
		.setAuthor('Disney+', 'https://cdn.discordapp.com/avatars/756233648486744085/894c5202b4bf59211f186dd31ae4d99a.webp');

	embed.addField('\u200B', '\u200B');

	for (const { hit } of searchResults.hits) {
		for (const text of hit.texts) {
			if (text.field === 'title' && text.type === 'full') {
				embed.addField(text.content, '\u200B');
			}
		}
	}

	message.reply(embed);
}

async function details(title, disneyClient, message) {
	const searchResults = await disneyClient.search(title);

	let content;
	let description;
	let titleFull;
	let imageURL;
	let type;
	let slug;
	let encodedFamilyId;

	// Filter the search results
	if (searchResults.meta.hits > 1) {

		for (const { hit } of searchResults.hits) {
			for (const text of hit.texts) {
				if (text.field === 'title' && text.type === 'full') {
					if (text.content.toLowerCase() === title.toLowerCase()) {
						content = hit;
						break;
					}
				}
			}
		}
	} else {
		content = searchResults.hits[0].hit;
	}

	if (!content) {
		console.warn('Failed to find media');
		return;
	}

	for (const text of content.texts) {
		if (text.language !== 'en') continue;

		if (text.field === 'title' && text.type === 'full') {
			titleFull = text.content;
		}

		if (text.field === 'title' && text.type === 'slug') {
			slug = text.content;
		}

		if (text.field === 'description' && text.type === 'medium') {
			description = text.content;
		}
	}

	for (const image of content.images) {
		if (image.purpose === 'tile' && image.sourceEntity === 'program' && image.aspectRatio === 1.78) {
			imageURL = image.url;
			break;
		}
	}

	type = content.programType + 's'; // "movie" -> "movies". Probably a better way to do this
	encodedFamilyId = content.family.encodedFamilyId;

	const embed = new Discord.MessageEmbed()
		.setColor(0x113CCF)
		.setTitle(`Click here to watch "${titleFull}" on Disney+`)
		.setURL(`https://www.disneyplus.com/${type}/${slug}/${encodedFamilyId}`)
		.setDescription(description)
		.setImage(imageURL)
		.setThumbnail("https://cdn.discordapp.com/avatars/756233648486744085/894c5202b4bf59211f186dd31ae4d99a.webp")
		.setAuthor('Disney+', 'https://cdn.discordapp.com/avatars/756233648486744085/894c5202b4bf59211f186dd31ae4d99a.webp');

		message.reply(embed);
}

module.exports = {
	search,
	details
};