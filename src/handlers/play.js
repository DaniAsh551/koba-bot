const { Message, Client } = require("discord.js");
const { buildPlayMessage, getUserProp } = require("../helper");
const playConfig = require("../config/play.json");
const KEY = "play";
const { createHandler, EVENT_TYPE } = require("../createHandler");

const help = () => "Type 'play [game]'\n ex: '/play apex'";

/**
 * Serves the play command on the server
 * @param {{ args:string[], message:Message, config:any, client: Client }} param0
 */
async function play({ args, message, config }) {
  var requestedGame = args[0].toLocaleLowerCase();
  if (!requestedGame) return help();

  let channelName = message.channel.name.toLocaleLowerCase();

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

  let role = game.role;
  let playMessage = buildPlayMessage({ role, user: message.member.user });

  if (!playMessage) return help();

  return playMessage;
}

module.exports = createHandler(KEY, play, EVENT_TYPE.MESSAGE);
