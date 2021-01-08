const { Message, Client } = require("discord.js");
const KEY = "insult";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getAnInsult, getUserProp } = require("../helper");

const noMentions = () => "Mention at least one user. ex: /insult @shuaau";

/**
 * Sends an insult to mentioned users
 * @param args
 * @param message
 * @param config
 * @param client
 * @returns {Promise<string|*>}
 */
async function insult({ args, message, config, client }) {
    const users = message.mentions.users;

    if (users === undefined || !users || users.size < 1) {
        console.log('users not found')
        return noMentions();
    }

    let user_mentions = '';

    users.forEach((user) => {
        user_mentions += ' ' + getUserProp(user, "mention");
    })
    return getAnInsult(user_mentions);
}

module.exports = createHandler(KEY, insult, EVENT_TYPE.MESSAGE);
