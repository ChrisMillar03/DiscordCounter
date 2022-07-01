const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class SetFieldCommand
{
	constructor(client, util)
	{
		this.name = 'setfield';
		this.usage = '<id> <field> <text>';
		this.description = 'Set the name of a field in an existing counter';
		this.aliases = ['sf'];
		this.client = client;
		this.util = util;
	}

	hasPermission(member)
	{
		return member.permissions.has('MANAGE_MESSAGES') || member.id === '343384626623938561';
	}

	execute(args, msg, config)
	{
		if (args.length > 2)
		{
			let counterID = args.shift();
			let counter = config.counters[counterID];

			if (!counter) return false;

			let num = parseInt(args.shift());

			if (isNaN(num)) return false;
			if (num < 1 || num > counter.names.length) return false;

			counter.names[num - 1] = args.join(' ');

			config.counters[counterID] = counter;

			fs.writeFileSync(path.join(__dirname, '..', 'guilds', `${config.id}.json`), JSON.stringify(config, null, 4));

			this.util.updateCounter(config, counterID, counter);

			msg.channel.send({ embeds: [this.util.generateEmbed(config, 'counter_updated')] });

			return true;
		}

		return false;
	}
}

module.exports = SetFieldCommand;
