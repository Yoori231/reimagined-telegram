const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Get help on commands",
  interaction: async (client, interaction) => {
    const commandList = Array.from(client.commands.keys()).join(", ");

    const embed = new MessageEmbed()
      .setTitle("*Need Help?*")
      .setURL(
        "https://discord.com/channels/1298118609054203904/1298630454554923048",
      )
      .setColor("DARK_BLUE")
      .setDescription(
        `### **Global Commands:** ${commandList} \n
        ` 
      )
      .setFooter({ text: "My prefix is ?" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
  