// Load up the discord.js library
const Discord = require("discord.js");
const handlers = require("./handlers");
const handlerKeys = Object.keys(handlers);
const { getJoke } = require("./helper");
const config = require("./config.json");
//bot client
const client = new Discord.Client();

//set a joke as activity
const setActivity = () => client.user.setActivity(getJoke());
//set a new joke every 12 hrs
setInterval(setActivity, 43200);

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );

  setTimeout(
    () =>
      client.user.setAvatar(
        require("fs").readFileSync(__dirname + "/avatar.png")
      ),
    5000
  );

  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  setActivity();
});

client.on("guildCreate", (guild) => {
  // This event triggers when the bot joins a guild.
  console.log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`
  );
  setActivity();
});

client.on("guildDelete", (guild) => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  setActivity();
});

client.on("message", async (message) => {
  // This event will run on every single message received, from any channel or DM.

  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;

  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file.
  if (!message.content.startsWith(config.prefix)) return;

  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Let's go with a few common example commands! Feel free to delete or change those.
  if (handlers[command]) {
    let resp = await handlers[command]({ args, message, config });
    if (!!resp) await message.channel.send(resp);
  } else {
    let resp = await handlers.help({ args, message, config });
    if (!!resp) await message.channel.send(resp);
  }
});

//Read token from env
const token =
  process.env.TOKEN ||
  require("fs")
    .readFileSync(__dirname + "/.env", {
      encoding: "utf-8",
    })
    .split("\n")
    .filter((x) => x.startsWith("TOKEN="))[0]
    .replace("TOKEN=", "");

client.login(token);

//expose web endpoint if on production
if (!!process.env.NODE_ENV) {
  const express = require("express");
  const app = express();
  app.get("/", (req, res) => res.send("Bot is running"));

  app.listen(process.env.PORT || 3000, () =>
    console.log("Started web endpoint")
  );
}
