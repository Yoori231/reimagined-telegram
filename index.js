const express = require("express");
const app = express();

app.listen(3000, () => {
  console.log("Project is running!");
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

const Discord = require("discord.js");
const { Permissions } = require("discord.js");
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "MESSAGE_CONTENT", "GUILD_MESSAGE_REACTIONS"],
});
const fs = require("fs");
const prefix = "|";
client.commands = new Discord.Collection();
const commands = fs
  .readdirSync("./Commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commands) {
  const commandName = file.split(".")[0];
  const command = require(`./Commands/${commandName}`);
  client.commands.set(commandName, command);
}

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await client.application.commands.fetch();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Map to store channels with auto-delete enabled
const autoDeleteChannels = new Map();
const deletionQueue = [];
let isProcessing = false;

async function processDeletionQueue() {
  while (deletionQueue.length > 0) {
    const message = deletionQueue.shift();
    try {
      await message.delete();
      console.log(
        `Deleted message from ${message.author.username} in channel ${message.channel.id}`
      );
    } catch (err) {
      console.error(`Failed to delete message: ${err}`);
    }
  }
  isProcessing = false;
}

async function processBatchDeletion() {
  const messagesToDelete = deletionQueue.splice(0, 45);
  try {
    await messagesToDelete[0].channel.bulkDelete(messagesToDelete, true);
    console.log(
      `Deleted ${messagesToDelete.length} messages in channel ${messagesToDelete[0].channel.id}`
    );
  } catch (err) {
    console.error(`Failed to bulk delete messages: ${err}`);
  }
  isProcessing = false;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Message listener
client.on("messageCreate", async (message) => {
  const lowercaseMessage = message.content.toLowerCase();

  // Auto-delete logic
  if (autoDeleteChannels.has(message.channel.id)) {
    deletionQueue.push(message);

    // Process the queue if it's not already processing
    if (!isProcessing) {
      isProcessing = true;
      if (deletionQueue.length <= 3) {
        processDeletionQueue();
      } else {
        processBatchDeletion();
      }
    }
  } else {
    if (lowercaseMessage === "ping") {
      const commandList = Array.from(client.commands.keys()).join(", ");
      message.channel.send(`Registered global commands: ${commandList}`);
    } else if (lowercaseMessage === "pong") {
      message.channel.send(
        `Current auto-delete channels: ${Array.from(autoDeleteChannels.keys()).join(", ")}`
      );
    } else if (lowercaseMessage === "pang") {
      try {
        const membersWithAccess = await message.guild.members.fetch();
        const allowedMembers = membersWithAccess.filter((member) => {
          const hasAccess =
            member.id === message.author.id ||
            member.id === "1298858635857756220"; // Staff ID, replace with actual ID

          const permissions = message.channel.permissionsFor(member);
          return hasAccess || (permissions && permissions.has(Permissions.FLAGS.VIEW_CHANNEL));
        });

        const memberNames = allowedMembers.map((member) => member.user.username).join(", ");
        message.channel.send(
          allowedMembers.size > 0
            ? `Members with access to this channel: ${memberNames}`
            : "There are no members with access to this channel."
        );
      } catch (error) {
        console.error("Error fetching members or processing access check:", error);
        message.channel.send("There was an error checking members with access.");
      }
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  if (!interaction.member) {
    return interaction.reply({
      content: "Commands cannot be used in direct messages.",
      ephemeral: true,
    });
  }

  const memberRoles = interaction.member.roles.cache;
  const hasAccess = command.allowedRoles
    ? command.allowedRoles.some((role) => memberRoles.some((r) => r.name === role))
    : true;

  if (!hasAccess) {
    return interaction.reply({
      content: "You do not have permission to use this command.",
      ephemeral: true,
    });
  }

  try {
    await command.interaction(client, interaction, autoDeleteChannels);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "There was an error executing that command!",
        ephemeral: true,
      });
    }
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login
client.login(process.env.token);
