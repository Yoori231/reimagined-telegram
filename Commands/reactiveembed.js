const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "testreactions",
  description: "Test reaction collector",
  async interaction(client, interaction) {
    const embed = new MessageEmbed()
      .setTitle("React to this!")
      .setDescription("React with 👍 or 👎")
      .setColor("BLUE");

    const testMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

    await testMessage.react("👍");
    await testMessage.react("👎");

    const filter = (reaction, user) => {
      return (reaction.emoji.name === "👍" || reaction.emoji.name === "👎") && !user.bot;
    };

    const collector = testMessage.createReactionCollector({ filter, dispose: true });

    collector.on("collect", (reaction, user) => {
      console.log(`${user.username} reacted with ${reaction.emoji.name}`);
    });

    collector.on("remove", (reaction, user) => {
      console.log(`${user.username} removed their reaction.`);
    });
  }
};
