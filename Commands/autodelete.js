const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "autodelete",
  description: "Set up or remove auto-delete feature",
  allowedRoles: ["Paquito"],
  interaction: async (client, interaction, autoDeleteChannels) => {
    // Check if the interaction is from a guild member
    const memberRoles = interaction.member?.roles?.cache;
    if (!memberRoles) {
      return await interaction.reply({
        content: "Could not retrieve your roles. Please try again.",
        ephemeral: true,
      });
    }

    const hasAccess = module.exports.allowedRoles.some((role) =>
      memberRoles.some((r) => r.name === role)
    );

    if (!hasAccess) {
      return await interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const option = interaction.options.getString("setup");

    if (option === "true") {
      const embed = new MessageEmbed()
        .setAuthor({ name: "🗑️ Auto-Delete 🗑️" })
        .setDescription("Auto-delete feature has been enabled.")
        .setFooter({ text: "💂‍♂️" })
        .setColor("RED");

      await interaction.reply({ embeds: [embed] });
      setTimeout(() => {
        autoDeleteChannels.set(interaction.channel.id, true);
      }, 1000);
    } else if (option === "false") {
      await autoDeleteChannels.delete(interaction.channel.id);

      const embed = new MessageEmbed()
        .setAuthor({ name: "🗑️ Auto-Delete 🗑️" })
        .setDescription("Auto-delete feature has been disabled.")
        .setFooter({ text: "🚛..." })
        .setColor("BLUE");

      setTimeout(() => {
        interaction.reply({ embeds: [embed] });
      }, 1000);
    }
  },
};
