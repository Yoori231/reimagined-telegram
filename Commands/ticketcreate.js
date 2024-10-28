const { Permissions } = require("discord.js");

module.exports = {
  name: "ticketcreate",
  description: "Create a private ticket channel",
  interaction: async (client, interaction) => {
    const blocklist = ["1298623470778712114"]; // Replace with actual role IDs or names

    // Check if the user has any of the blocked roles
    const memberRoles = interaction.member.roles.cache.map((role) => role.id);
    const isBlocked = blocklist.some((role) => memberRoles.includes(role));

    if (isBlocked) {
      return interaction.reply({
        content: "You can only have **one** ticket per account",
        ephemeral: true,
      });
    }

    // Ensure the interaction is from a guild
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
    }

    // Create a private channel
    const channel = await interaction.guild.channels.create(
      `ticket-${interaction.user.username}`,
      {
        type: "GUILD_TEXT",
        parent: "1298118609054203906", // Set the category ID here
        permissionOverwrites: [
          {
            id: interaction.guild.id, // Deny access to @everyone
            deny: [
              Permissions.FLAGS.VIEW_CHANNEL,
              Permissions.FLAGS.CREATE_INSTANT_INVITE,
              Permissions.FLAGS.ATTACH_FILES, // Deny invite creation
            ],
          },
          {
            id: interaction.user.id, // Allow access to the user who requested
            allow: [
              Permissions.FLAGS.VIEW_CHANNEL,
              // No need to allow CREATE_INSTANT_INVITE here
            ],
          },
          {
            id: "1298858635857756220", // Replace with your staff/user ID to allow access
            allow: [
              Permissions.FLAGS.VIEW_CHANNEL,
              // No need to allow CREATE_INSTANT_INVITE here
            ],
          },
        ],
      },
    );

    // Assign the role to the user
    const role = interaction.guild.roles.cache.find(
      (r) => r.name === "Ticket{Occupied}",
    );
    if (role) {
      await interaction.member.roles.add(role);
    }

    // Fetch all members in the guild
    const membersWithAccess = await interaction.guild.members.fetch();
    // Filter members based on your access logic
    const allowedMembers = membersWithAccess.filter((member) => {
      // Logic to determine access
      const hasAccess =
        member.id === interaction.user.id || // Ticket creator
        member.id === "1252568571960365110"; // Staff member

      const permissions = channel.permissionsFor(member);
      const hasChannelPermission = permissions.has(
        Permissions.FLAGS.VIEW_CHANNEL,
      );

      return hasAccess || hasChannelPermission; // Final filter condition
    });

    // Gather usernames
    const allowedUsernames = allowedMembers
      .map((member) => member.user.username)
      .join(", ");
    const allowedCount = allowedMembers.size;

    // Combine the responses into a single reply
    await interaction.reply({
      content: `Ticket created: ${channel} <-- Press/Click\n\nUsers with access: ${allowedCount}\nUsernames: ${allowedUsernames}`,
      ephemeral: true,
    });
  },
};
