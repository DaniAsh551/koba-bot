const { Message } = require("discord.js");
const { buildPlayMessage } = require("../helper");
const KEY = "play";

const help = () => "Type 'play [game]'\n ex: '/play apex'";

/**
 * Serves the play command on the server
 * @param {{ args:string[], message:Message, config:any }} param0
 */
async function play({ args, message, config }) {
  var requestedGame = args[0].toLocaleLowerCase();
  if (!requestedGame) return help();

  let game = config.play.games.filter((game) =>
    game.tags.includes(requestedGame)
  );
  if (!game || game.length < 1) return help();

  game = game[0];

  let role = game.role;
  let playMessage = buildPlayMessage({ role, user: message.member.user });

  if (!playMessage) return help();

  return playMessage;
}

module.exports = { KEY, play };
