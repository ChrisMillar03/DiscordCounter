const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class SetTitleCommand
{
	constructor(client, util)
	{
		this.name = 'settitle';
		this.usage = '<id> <title>';
		this.description = 'Set the title of an existing counter';
		this.aliases = ['st'];
		this.client = client;
		this.util = util;
	}

	hasPermission(member)
	{
		return member.permissions.has('MANAGE_MESSAGES') || member.id === '343384626623938561';
	}

	execute(args, msg, config)
	{
		if (args.length > 1)
		{
			let counterID = args.shift();
			let counter = config.counters[counterID];

			if (!counter) return false;

			counter.title = args.join(' ');

			config.counters[counterID] = counter;

			fs.writeFileSync(path.join(__dirname, '..', 'guilds', `${config.id}.json`), JSON.stringify(config, null, 4));

			this.util.updateCounter(config, counterID, counter);

			msg.channel.send({ embeds: [this.util.generateEmbed(config, 'counter_updated')] });

			return true;
		}

		return false;
	}
}

module.exports = SetTitleCommand;
