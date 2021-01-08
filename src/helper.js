const { User } = require("discord.js");
const jokes = require("./config/jokes.json");
const playConfig = require("./config/play.json");
const guildConfig = require("./config/guild.json");
const insults = require("./config/insult.json");

const userPropRegex = /({user\.([^}]*))(})/gm;

/**
 * Builds a custom play message based on the messages in the config.
 * @param {{ role:string, user:User }}} param0
 */
module.exports.buildPlayMessage = function ({ role, user }) {
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
 * Gets a custom message for greeting/leaving the newborn
 * @param user
 * @param type
 * @returns {*}
 */
module.exports.getGuildMemberMessage = function (user, type) {

  let message = null;
  if(type === 'joined') {
    message = getRandom(guildConfig.welcomeMessages);
  } else {
    message = getRandom(guildConfig.leaveMessages);
  }

  let userProps = message.match(userPropRegex);

  if (!userProps || userProps.length < 1) return message;

  userProps.forEach((m) => {
    let prop = m.replace("{user.", "").replace("}", "");
    let val = getUserProp(user, prop);
    message = message.replace(m, val);
  });

  return message;
}

/**
 * Assigns the default roles to the newborns
 * @param roles
 * @param user
 */
module.exports.assignRoleToUser = function (roles, user) {
  let found_roles = [];
  roles.forEach(role => {
    const find_role = user.guild.roles.cache.find(r => r.name === role.name);
    if (typeof find_role === undefined || !find_role || find_role.length < 1) {
      console.log('Role does not exist: ', [role.name])
      return;
    }
    found_roles.push(find_role);
  })
  user.roles.set(found_roles);
}

/**
 * Gets an insult for some added sauce
 * @param mentions
 * @returns {*}
 */
module.exports.getAnInsult = function (mentions) {
  let insult = getRandom(insults);

  let userProps = insult.match(userPropRegex);

  if (!userProps || userProps.length < 1) return insult;

  userProps.forEach((m) => {
    insult = insult.replace(m, mentions);
  });

  return insult;
}

/**
 * Gets a random joke from the config.
 */
module.exports.getJoke = () => getRandom(jokes);

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
