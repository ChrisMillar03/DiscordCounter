const Discord = require('discord.js');
const Util = require('./util.js');
const path = require('path');
const fs = require('fs');

if (!process.env.BOT_TOKEN) process.env.BOT_TOKEN = fs.readFileSync(path.join(__dirname, 'token.txt'), { 'encoding': 'utf8', 'flag': 'r' });

['commands', 'guilds'].forEach(i =>
{
	if (!fs.existsSync(path.join(__dirname, i))) fs.mkdirSync(path.join(__dirname, i));
});

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const util = new Util(client);

const commandsFolder = path.join(__dirname, 'commands');

let commands = new Map();

fs.readdirSync(commandsFolder).forEach(file =>
{
	if (!fs.lstatSync(path.join(commandsFolder, file)).isDirectory())
	{
		let CommandExecutor = require(path.join(commandsFolder, file));
		let command = new CommandExecutor(client, util);

		if (command.name !== 'help') commands.set(command.name, command);
	}
});

client.on('raw', packet =>
{
	switch (packet.t)
	{
		case 'MESSAGE_REACTION_ADD':
		case 'MESSAGE_REACTION_REMOVE':
			const channel = client.channels.cache.get(packet.d.channel_id);

			if (channel.messages.cache.has(packet.d.message_id)) return;

			channel.messages.fetch(packet.d.message_id).then(msg =>
			{
				const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
				const reaction = msg.reactions.cache.get(emoji);

				if (reaction) reaction.users.cache.set(packet.d.user_id, client.users.cache.get(packet.d.user_id));

				if (packet.t === 'MESSAGE_REACTION_ADD')
				{
					client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
				}
				else if (packet.t === 'MESSAGE_REACTION_REMOVE')
				{
					client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
				}
			});

			return;
	}
});

client.on('messageCreate', async msg =>
{
	if (msg.author.bot || msg.channel.type === 'dm') return;

	let config = util.getServerConfig(msg.guild.id);

	let args = msg.content.split(/ +/);
	let prefix = args[0].slice(0, config.prefix.length);
	let cmd = args.shift().toLowerCase().slice(config.prefix.length);

	if (prefix === config.prefix)
	{
		if (cmd === 'help')
		{
			if (args[0])
			{
				msg.channel.send({ embeds: [util.createHelpEmbed(config, commands.get(args[0]))] });
			}
			else
			{
				let maxFields = 16;
				let helpEmbeds = [];
				let index = 0;

				commands.forEach(command =>
				{
					let page = Math.floor(index / maxFields);

					if (!helpEmbeds[page])
					{
						helpEmbeds.push(new Discord.MessageEmbed());
						helpEmbeds[page].setColor(config.embedColor);
						helpEmbeds[page].setTitle(`Command List Page ${page + 1}`);
					}

					if (command.hasPermission(msg.member))
					{
						helpEmbeds[page].addField(`${config.prefix}${command.name} ${command.usage}`, command.description);
						index++;
					}
				});

				if (helpEmbeds.length === 0)
				{
					helpEmbeds.push(new Discord.MessageEmbed());
					helpEmbeds[0].setColor(config.errorColor);
					helpEmbeds[0].setTitle(':x: No commands registered!');
				}

				helpEmbeds.forEach(helpEmbed =>
				{
					msg.channel.send({ embeds: [helpEmbed] });
				});
			}
		}
		else
		{
			let executed = false;

			commands.forEach(command =>
			{
				if (executed) return;

				if (![...command.aliases, command.name].includes(cmd)) return;

				if (!command.hasPermission(msg.member))
				{
					msg.channel.send({ embeds: [util.generateEmbed(config, 'no_permission')] });

					executed = true;

					return;
				}

				if (!command.execute(args, msg, config)) msg.channel.send({ embeds: [util.createHelpEmbed(config, command)] });

				executed = true;
			});

			if (!executed)
			{
				msg.channel.send({ embeds: [util.createHelpEmbed(config, null)] });
			}
		}
	}
	else if (msg.mentions.has(client.user) && msg.type !== 'REPLY')
	{
		msg.channel.send({ embeds: [util.generateEmbed(config, 'bot_prefix')] });
	}
});

client.on('ready', _ =>
{
	console.log('Bot Ready');
});

client.login(process.env.BOT_TOKEN);
