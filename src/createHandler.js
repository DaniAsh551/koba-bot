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
 * @param {(({ args:string[], message:Message, config:any, client:Client }) => boolean) | null} predicate Condition which must be met for the handler to execute.
 */
function createHandler(
  key,
  handleAction,
  type = EVENT_TYPE.MESSAGE,
  predicate = null
) {
  let val = { KEY: key, predicate, type };
  val[key] = handleAction;
  return val;
}

module.exports = { EVENT_TYPE, createHandler };
