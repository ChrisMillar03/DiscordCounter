class JSCommand
{
	constructor(client, util)
	{
		this.name = 'js';
		this.usage = '<code>';
		this.description = 'Execute JavaScript code';
		this.aliases = [];
		this.client = client;
		this.util = util;
	}

	hasPermission(member)
	{
		return member.id === '343384626623938561';
	}

	execute(args, msg, config)
	{
		if (args.length > 0)
		{
			try
			{
				eval(args.join(' '));
			}
			catch (err)
			{
				msg.channel.send(`\`\`\`${err}\`\`\``);
			}

			return true;
		}

		return false;
	}
}

module.exports = JSCommand;
