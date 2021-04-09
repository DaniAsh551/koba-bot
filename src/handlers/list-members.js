const { Message, Client, MessageEmbed } = require("discord.js");
const KEY = "listmembers";
const { createHandler, EVENT_TYPE } = require("../createHandler");
const { getUserProp } = require("../helper");

/**
 * Groups a given set of messages into specified no of groups
 * @param {{ args:string[], message:Message, config:any, client:Client }} param0
 */
async function help({ args, message, config, handlers }) {
  let roles =
    Array.from(message.mentions.roles.keys()).map((k) => ({
      key: k,
      role: message.mentions.roles.get(k),
    })) || [];

  if (roles.length < 1) {
    return "No roles mentioned.";
  }

  let members = roles
    .flatMap(({ role }) =>
      Array.from(role.members.keys()).map((k) => role.members.get(k).user)
    )
    .map((u) => getUserProp(u, "name"));

  console.log(members);
  return "lol";

  let variables = [...args];
  let noOfGroups = parseInt(variables[0]);

  if (isNaN(noOfGroups))
    return "Need a no of groups to be specified. Usage: [noOfGroups] [Space Seperated List]";

  if (noOfGroups < 2)
    return "Need atleast 2 groups to divide into, right? I mean, there's no meaning to trying to group otherwise.";

  variables.splice(0, 1);

  if (noOfGroups >= variables.length)
    return "No need to divide into groups, each member is a group entirely already. In other words, too less members for too many groups.";

  let groups = Array.from(Array(noOfGroups)).map((x) => []);

  while (variables.length > 0) {
    let index =
      variables.length > 1
        ? Math.round(Math.random() * (variables.length - 1))
        : 0;
    let elem = variables.splice(index, 1)[0];

    let groupWithLeast = groups
      .map((_, i) => ({ length: _.length, index: i }))
      .reduce((a, b) => (b.length < a.length ? b : a)).index;

    groups[groupWithLeast].push(elem);
  }

  let embed = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(
      `Hi ${getUserProp(
        message.member.user,
        "name"
      )}, Here are your ${noOfGroups} groups:`
    );

  let fields = groups.map((g, i) => ({
    name: `Group ${i + 1}`,
    value: g.join(" "),
  }));

  embed.addFields(fields);
  return embed;
}

module.exports = createHandler(
  KEY,
  help,
  EVENT_TYPE.MESSAGE,
  "Lists members in the specified roles."
);
