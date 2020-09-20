require('dotenv').config();
const DisneyPlusClient = require('disneyplus-client');
const Discord = require('discord.js');
const commands = require('./commands');

const disneyClient = new DisneyPlusClient();
const discordClient = new Discord.Client();

disneyClient.on('ready', async () => {
	// Login the user as if we have never connected before
	// Normally you would reuse a refresh token

	await disneyClient.createDeviceGrant(); // Get device grant token
	await disneyClient.exchangeDeviceToken(); // Convert that token into an OAuth token (Disney+ requires an OAuth token even for logging in)
	await disneyClient.login(process.env.DISNEY_PLUS_EMAIL, process.env.DISNEY_PLUS_PASSWORD); // Login the user (this does more stuff under the hood)

	discordClient.login(process.env.DISCORD_BOT_TOKEN);
});

discordClient.on('ready', async () => {
	console.log(`Logged in as ${discordClient.user.tag}!`);
});

discordClient.on('message', message => {
	if (message.author.id === discordClient.user.id) return;

	if (message.content.startsWith('d+')) {
		const commandName = message.content.split(' ')[1];
		const commandArgs = message.content.split(' ').slice(2).join(' ');
		
		if (!commands[commandName]) {
			console.warn('No command ' + commandName + ' found');
			return;
		}

		return commands[commandName](commandArgs, disneyClient, message);
	}
});


function start() {
	disneyClient.init();
}

module.exports = {
	start
};