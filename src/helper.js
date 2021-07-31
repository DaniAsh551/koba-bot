const { User, Channel } = require("discord.js");
const {getConfig} = require("./config");

const userPropRegex = /({user\.([^}]*))(})/gm;

/**
 * Builds a custom play message based on the messages in the config.
 * @param {string} guildId Id of the current guild.
 * @param {{ role:string, user:User }}} param1
 */
module.exports.buildPlayMessage = function (guildId, { role, user }) {
  let playConfig = getConfig(guildId, "play.json");
  let message = getRandom(playConfig.messages);
  message = replaceAll(message, "{role}", role);

  let userProps = message.match(userPropRegex);

  if (!userProps || userProps.length < 1) return message;

  userProps.forEach((m) => {
    let prop = m.replace("{user.", "").replace("}", "");
    let val = getUserProp(user, prop);
    message = message.replace(m, val);
  });

  return message;
};

/**
 * Gets a random joke from the config.
 */
module.exports.getJoke = () => getRandom(getConfig("default","jokes.json"));

/**
 * Returns a random element of the given array
 * @param {Array} array
 */
function getRandom(array) {
  let rand = Math.round(Math.random() * (array.length - 1));
  return array[rand];
}

/**
 * Replaces all occurences with given string in a source string
 * @param {string} src
 * @param {string} needle
 * @param {string} replace
 */
function replaceAll(src, needle, replace) {
  while (src.includes(needle)) src = src.replace(needle, replace);
  return src;
}

/**
 * Returns a specified property from user object
 * @param {User} user
 * @param {string} prop
 */
function getUserProp(user, prop) {
  switch (prop) {
    case "mention":
      return `<@${user.id}>`;
    case "name":
      return user.username;
    default:
      return user[prop];
  }
}
module.exports.getUserProp = getUserProp;

/**
 * Returns a specified property from channel object
 * @param {Channel} channel
 * @param {string} prop
 */
function getChannelProp(channel, prop) {
  switch (prop) {
    case "mention":
      return `<#${channel.id}>`;
    default:
      return channel[prop];
  }
}

module.exports.getChannelProp = getChannelProp;
