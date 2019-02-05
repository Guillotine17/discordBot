var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
logger.info(auth.token);
var bot = new Discord.Client();
logger.info(bot);

bot.on('ready', function(evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', message => {
    if (message.content.substring(0, 1) === '!') {
        const args = message.content.split(' ');
        console.log('args', args);
        switch (args[0]) {
            case '!ping':
                message.reply('Pong');
                break;
            case '!getInfo':
                logger.info('=========users mentions=========');
                logger.info(message.mentions.users.array());
                const mentionedUsers = message.mentions.users.array();
                if (mentionedUsers.length) {
                    mentionedUsers.forEach((mentionedUser) => {
                        message.reply(mentionedUser.username);
                    });
                }
                break;
            case '!garbage':
                message.reply('rude.');
                break;
        }
    }
});
bot.login(auth.token);
