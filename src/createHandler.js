const { Client } = require("discord.js");
/**
 * Defines the types of events.
 */
const EVENT_TYPE = {
  EVENT: "EVENT",
  MESSAGE: "MESSAGE",
  TIME: "TIME",
};

/**
 * Creates a new handler.
 * @param {string} key Unique event identifier.
 * @param {({ args:string[], message:Message, config:any, client:Client }) => void} handleAction Event handle action.
 * @param {EVENT_TYPE | string} type
 * @param {string} description Description of the handler.
 */
function createHandler(
  key,
  handleAction,
  type = EVENT_TYPE.MESSAGE,
  description = null
) {
  let val = { KEY: key, type, description };
  val[key] = handleAction;
  return val;
}

module.exports = { EVENT_TYPE, createHandler };
