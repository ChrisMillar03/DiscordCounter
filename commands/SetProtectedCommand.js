const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class SetProtectedCommand
{
	constructor(client, util)
	{
		this.name = 'setprotected';
		this.usage = '<id> <value>';
		this.description = 'Set the protected state of an existing counter (1 or 0)';
		this.aliases = ['sp'];
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

			let value = parseInt(args.shift());

			if (isNaN(value)) return false;

			counter.protected = Boolean(value);

			config.counters[counterID] = counter;

			fs.writeFileSync(path.join(__dirname, '..', 'guilds', `${config.id}.json`), JSON.stringify(config, null, 4));

			msg.channel.send({ embeds: [this.util.generateEmbed(config, 'counter_updated')] });

			return true;
		}

		return false;
	}
}

module.exports = SetProtectedCommand;
