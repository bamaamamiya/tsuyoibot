const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specific number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Delete messages only from this user (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('target');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ You need to input a number between 1 and 100.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });

      let filtered;

      if (targetUser) {
        filtered = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
      } else {
        filtered = messages.first(amount);
      }

      const deleted = await interaction.channel.bulkDelete(filtered, true);

      await interaction.editReply({ content: `✅ Deleted ${deleted.size} message(s)${targetUser ? ` from ${targetUser.tag}` : ''}.` });
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.editReply({ content: '❌ Failed to delete messages. Maybe some are older than 14 days?' });
    }
  }
};
