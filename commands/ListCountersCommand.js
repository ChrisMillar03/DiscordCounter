class ListCountersCommand
{
	constructor(client, util)
	{
		this.name = 'listcounters';
		this.usage = '';
		this.description = 'List all counters';
		this.aliases = ['lc'];
		this.client = client;
		this.util = util;
	}

	hasPermission(member)
	{
		return member.permissions.has('MANAGE_MESSAGES') || member.id === '343384626623938561';
	}

	execute(args, msg, config)
	{
		let list = [];

		for (let i in config.counters)
		{
			list.push(`\`${config.counters[i].title}\` | https://discord.com/channels/${config.id}/${config.counters[i].channel}/${i}`);
		}

		if (list.length === 0) list.push('None');

		msg.channel.send({ content: list.join('\n') });

		return true;
	}
}

module.exports = ListCountersCommand;
