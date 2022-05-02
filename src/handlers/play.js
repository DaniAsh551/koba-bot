const ts = require('timestring');

const { Message, Client, ReplyMessageOptions } = require("discord.js");
const { buildPlayMessage, getUserProp } = require("../helper");
const { getConfig } = require("../config")
const KEY = "play";
const { createHandler, EVENT_TYPE } = require("../createHandler");

const help = () => `Type 'play [game]'
    OR
  play in [time]`;

/**
 * Serves the play command on the server
 * @param {{ args:string[], message:Message, config:any, client: Client }} param0
 */
async function play({ args, message, config, client }) {

  let guildId = message.guild.id;

  let requestedGame = args && args[0] && args[0].toLocaleLowerCase();
  let period = requestedGame == 'in' ? args.slice(1).join(" ") : null;

  const replyPlayMessage = (message, requestedGame) => {
    let role = game.role;
    let playMessage = buildPlayMessage(guildId, { role, user: message.member.user });

    if (!playMessage) return help();

    return playMessage;
  };

  let channelName = message.channel.name.toLocaleLowerCase();
  let playConfig = getConfig(guildId, "play.json");

  if (!requestedGame || requestedGame == "in") {
    let gameTagChannel = playConfig["channel-game-tag-relationships"].filter(
      (x) => x.channel === channelName
    );

    if (gameTagChannel.length < 1) return help();

    requestedGame = gameTagChannel[0].tag;
  }

  let game = playConfig.games.filter((game) =>
    game.tags.includes(requestedGame)
  );
  if (!game || game.length < 1) return help();

  game = game[0];

  if (game.channels) {
    const isNotAllowed =
      (game.channels.blacklist &&
        game.channels.blacklist.length > 0 &&
        game.channels.blacklist.includes(channelName)) ||
      (game.channels.whitelist &&
        game.channels.whitelist.length > 0 &&
        !game.channels.whitelist.includes(channelName));
    if (isNotAllowed)
      return `Hey ${getUserProp(
        message.member.user,
        "mention"
      )}, you cannot use this command here.`;
  }

  //if requested to play in some time
  if(period) {
    let periodString = period;
    period = ts(period, 'ms');

    if(period < 5*60*1000 || period > 5 * 60 * 60 * 1000){// <5minutes || >5hrs
      return "The waiting period needs to be between 5mins and 5 hours.";
    }

    setTimeout(() => {
      message.reply(replyPlayMessage(message, requestedGame));
    }, period);

    return `Okay ${getUserProp(message.member.user, "mention")}! I'll ping in ${periodString}!`;
  }else{
    return replyPlayMessage(message, requestedGame);
  }
}

module.exports = createHandler(
  KEY,
  play,
  EVENT_TYPE.MESSAGE,
  "Serves the play command on the server"
);
