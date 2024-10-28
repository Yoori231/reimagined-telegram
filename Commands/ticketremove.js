const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "ticketclose",
  description: "Close a private ticket channel",
  interaction: async (client, interaction) => {
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    // Check if the channel name starts with "ticket-"
    if (!interaction.channel.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "You can only close your ticket in the ticket channel.",
        ephemeral: true,
      });
    }

    // Check if there are more than 3 members in the channel
    const membersInChannel = interaction.channel.members; // Get the members in the channel
    if (membersInChannel.size > 3) {
      const embed = new MessageEmbed()
        .setTitle("👷‍♂️ Seal Deal Confirmation 👷‍♂️")
        .setDescription("Would you like to close this ticket? React with ⭕ to confirm.")
        .setColor("RED");

      const testMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
      await testMessage.react("⭕");

      // Set up a reaction collector
      const filter = (reaction, user) => {
        return reaction.emoji.name === "⭕" && !user.bot; // Only count the reactions from non-bots
      };

      const collector = testMessage.createReactionCollector(filter);

      collector.on("collect", async (reaction, user) => {
        // Check how many reactions there are
        if (reaction.count >= 3) {
          // Close the ticket if the confirmation is met
          const role = interaction.guild.roles.cache.find(
            (r) => r.name === "Ticket{Occupied}",
          );
          if (role) {
            await interaction.member.roles.remove(role);
          }

          collector.stop();
          await interaction.channel.delete();  
        }
      });

      collector.on("remove", async (reaction, user) => {
        // Check if the reaction count is less than 3
        if (reaction.count < 3) {
          await interaction.followUp({
            content: "Ticket closure not confirmed. The ticket will remain open.",
            ephemeral: true,
          });
        }
      });

    } else {
      const role = interaction.guild.roles.cache.find(
        (r) => r.name === "Ticket{Occupied}",
      );
      if (role) {
        await interaction.member.roles.remove(role);
      }
      
      await interaction.channel.delete();
    }
  },
};
