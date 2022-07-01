const Discord = require('discord.js');
const path = require('path');
const fs = require('fs');

class CounterCommand
{
	constructor(client, util)
	{
		this.name = 'counter';
		this.usage = '<count> <title>';
		this.description = 'Create a counter with the specified number of options (1-9)';
		this.aliases = ['c'];
		this.client = client;
		this.util = util;

		client.on('messageReactionAdd', async (reaction, user) =>
		{
			if (!reaction) return;
			if (user.bot) return;

			if (reaction.partial)
			{
				try
				{
					await reaction.fetch();
				}
				catch (error)
				{
					return;
				}
			}

			let serverConfig = this.util.getServerConfig(reaction.message.guild.id);

			if (!serverConfig) return;

			let counter = serverConfig.counters[reaction.message.id];

			if (!counter) return;

			reaction.users.remove(user.id);

			if (user.id !== counter.owner && counter.protected) return;

			let num = this.util.emojiToNum(reaction._emoji.name);

			if (num < 1 || num > counter.counts.length) return;

			counter.counts[num - 1]++;

			serverConfig.counters[reaction.message.id] = counter;

			fs.writeFileSync(path.join(__dirname, '..', 'guilds', `${serverConfig.id}.json`), JSON.stringify(serverConfig, null, 4));

			reaction.message.edit({ embeds: [this.util.createCounterEmbed(serverConfig, counter)] });
		});
	}

	hasPermission(member)
	{
		return member.permissions.has('MANAGE_MESSAGES') || member.id === '343384626623938561';
	}

	execute(args, msg, config)
	{
		if (args.length > 1)
		{
			let num = parseInt(args.shift());

			if (isNaN(num)) return false;
			if (num < 1 || num > 9) return false;

			let counterObject = {};

			counterObject.owner = msg.author.id;
			counterObject.ownerName = `${msg.author.username}#${msg.author.discriminator}`;
			counterObject.channel = msg.channel.id;
			counterObject.protected = true;
			counterObject.title = args.join(' ');
			counterObject.names = [...Array(num)].map(_ => { return 'Option'; });
			counterObject.counts = [...Array(num)].map(_ => { return 0; });

			let counterEmbed = this.util.createCounterEmbed(config, counterObject);

			msg.channel.send({ embeds: [counterEmbed] }).then(async newMsg =>
			{
				config.counters[newMsg.id] = counterObject;

				fs.writeFileSync(path.join(__dirname, '..', 'guilds', `${config.id}.json`), JSON.stringify(config, null, 4));

				for (let i = 1; i <= num; i++)
				{
					newMsg.react(this.util.numToEmoji(i));
				}
			});

			return true;
		}

		return false;
	}
}

module.exports = CounterCommand;
