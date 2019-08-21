#!/usr/bin/env nodejs
var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var dbStuff = require('./dbstuff');
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
        const mentionedUsers = message.mentions.users.array();
        logger.info('args', args);
        switch (args[0]) {
            case '!ping':
                message.reply('Pong');
                break;
            case '!getInfo':
                logger.info('=========users mentions=========');
                logger.info(message.mentions.users.array());
                if (mentionedUsers.length) {
                    mentionedUsers.forEach((mentionedUser) => {
                        dbStuff.getUserOrCreate(mentionedUser).then(function(getUserResult) {
                            message.reply(JSON.stringify(getUserResult));
                        });
                        message.reply(mentionedUser.id);
                    });
                }
                break;
            case '!garbage':
                message.reply('rude.');
                break;
            case '!demerit':
                logger.info('message keys: ', Object.keys(message));
                logger.info('author keys: ', Object.keys(message.author));
                // get user from db
                var recipients = [];
                if (mentionedUsers && mentionedUsers.length) {
                    mentionedUsers.forEach((mentionedUser) => {
                        recipients.push(mentionedUser);
                    });
                } else {
                    message.reply('no tagged users');
                    break;
                }
                dbStuff.getUserOrCreate(message.author).then(function(getEnforcerResult) {
                    logger.info('getEnforcerResult', getEnforcerResult);
                    var getRecipientPromises = [];
                    if (!getEnforcerResult.enforcer) {
                        message.reply('goyim trash.');
                        throw new Error('TRAISH');
                    };
                    if (getEnforcerResult.enforcer) {
                        getEnforcerResult.demeritgivencount += mentionedUsers.length;
                        dbStuff.updateDemeritsGiven(getEnforcerResult.snowflake, getEnforcerResult.demeritgivencount).then((result) => {
                            message.reply('shalom, enforcer');
                            mentionedUsers.forEach((mentionedUser) => {
                                getRecipientPromises.push(dbStuff.getUserOrCreate(mentionedUser));
                            });
                        });
                    }
                    return Promise.all(getRecipientPromises);
                }).then(function(getUserResults) {
                    var applyDemeritsPromises = [];
                    getUserResults.forEach(function(user) {
                        console.log('getUserResult');
                        console.log(user);
                        applyDemeritsPromises.push(dbStuff.applyDemerit(user));
                        return Promise.all(applyDemeritsPromises);
                    });
                }).then((applyDemeritResults) => {
                    applyDemeritResults.forEach((result) => {
                        message.reply(`${result.username} new demerit count: ${result.count}`);
                    });
                }).catch((err) => {
                    logger.error(err);
                });




                // verify tagged user exists in db
                // verify that enforcer is in db and is enforcer // user type should be handled through discord
                // insert into demerit table
                // increment users demerit count
                // increment users enforcer count

                break;
            case '!listUsers':
                message.reply('WIP');
                logger.info('WIP');
                break;
            case '!listdemerits':
                message.reply('WIP');
                logger.info('WIP');
                break;
            }
    }
});
bot.login(auth.token);

// fucking circular objects :(
function prettyLog(thing) {
    return JSON.stringify(thing, null, 2);
}
