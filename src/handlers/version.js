const { Message, Client } = require("discord.js");
const KEY = "version";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { version } = require("../../package.json");

/**
 *
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function help({ args, message, config }) {
  return `kb-bot version ${version}`;
}

module.exports = createHandler(KEY, help, EVENT_TYPE.MESSAGE);
