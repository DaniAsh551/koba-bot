const { User } = require("discord.js");
const config = require("./config.json");

const userPropRegex = /({user\.([^}]*))(})/gm;

/**
 * Builds a custom play message based on the messages in the config.
 * @param {{ role:string, user:User }}} param0
 */
module.exports.buildPlayMessage = function ({ role, user }) {
  let message = getRandom(config.play.messages);
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
module.exports.getJoke = () => getRandom(config.jokes);

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
