const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class Util
{
	constructor(client)
	{
		this.client = client;
	}

	getServerConfig(guildID)
	{
		let serverFile = path.join(__dirname, 'guilds', `${guildID}.json`);
		let firstWrite = true;
		let config = {};

		if (fs.existsSync(serverFile))
		{
			config = JSON.parse(fs.readFileSync(serverFile, { 'encoding': 'utf8', 'flag': 'r' }));
			firstWrite = false;
		}

		config.id = config.id || guildID;
		config.prefix = config.prefix || 'c;';
		config.premium = config.premium || false;
		config.embedColor = config.embedColor || '#fc7b03';
		config.successColor = config.successColor || '#00ee00';
		config.errorColor = config.errorColor || '#ee0000';
		config.infoColor = config.infoColor || '#0077ee';
		config.counters = config.counters || {};

		if (firstWrite) fs.writeFileSync(serverFile, JSON.stringify(config, null, 4));

		return config;
	}

	updateCounter(config, counterID, counter)
	{
		this.client.channels.fetch(counter.channel).then(channel =>
		{
			if (!channel) return;

			channel.messages.fetch(counterID).then(msg =>
			{
				if (!msg) return;

				msg.edit({ embeds: [this.createCounterEmbed(config, counter)] });
			});
		});
	}

	createHelpEmbed(config, command)
	{
		let helpEmbed = new Discord.MessageEmbed();

		if (command)
		{
			helpEmbed.setColor(config.embedColor);
			helpEmbed.setTitle(`${config.prefix}${command.name} usage`);
			helpEmbed.addField('Description:', command.description, true);
			helpEmbed.addField('Usage:', `${config.prefix}${command.name} ${command.usage}`, true);
			helpEmbed.addField('Alias(es):', command.aliases.length ? command.aliases.map(a => `${config.prefix}${a}`).toString(): 'None', true);
		}
		else
		{
			helpEmbed.setColor(config.errorColor);
			helpEmbed.setTitle(`:x: Command not recognised!`);
		}

		return helpEmbed;
	}

	createCounterEmbed(config, counter)
	{
		let counterEmbed = new Discord.MessageEmbed();

		counterEmbed.setColor(config.embedColor);
		counterEmbed.setTitle(`${counter.title}`);

		for (let i = 1; i <= counter.counts.length; i++)
		{
			counterEmbed.addField(`${counter.names[i - 1]}`, `${counter.counts[i - 1]}`, false);
		}

		counterEmbed.setFooter({ text: `Created by ${counter.ownerName}` });

		return counterEmbed;
	}

	generateEmbed(config, type)
	{
		let embed = new Discord.MessageEmbed();

		switch (type)
		{
			case 'bot_prefix':
				embed.setColor(config.infoColor);
				embed.setTitle(`:information_source: My prefix is \`${config.prefix}\``);
				break;

			case 'counter_updated':
				embed.setColor(config.successColor);
				embed.setTitle(':white_check_mark: Updated counter successfully!');
				break;

			case 'no_permission':
				embed.setColor(config.errorColor);
				embed.setTitle(':x: You don\'t have permission to run this command!');
				break;
		}

		return embed;
	}

	numToEmoji(num)
	{
		switch (num)
		{
			case 1:
				return '1️⃣';

			case 2:
				return '2️⃣';

			case 3:
				return '3️⃣';

			case 4:
				return '4️⃣';

			case 5:
				return '5️⃣';

			case 6:
				return '6️⃣';

			case 7:
				return '7️⃣';

			case 8:
				return '8️⃣';

			case 9:
				return '9️⃣';

			default:
				return '0️⃣';
		}
	}

	emojiToNum(emoji)
	{
		switch (emoji)
		{
			case '1️⃣':
				return 1;

			case '2️⃣':
				return 2;

			case '3️⃣':
				return 3;

			case '4️⃣':
				return 4;

			case '5️⃣':
				return 5;

			case '6️⃣':
				return 6;

			case '7️⃣':
				return 7;

			case '8️⃣':
				return 8;

			case '9️⃣':
				return 9;

			default:
				return 0;
		}
	}
}

module.exports = Util;
