const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specific number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ You need to input a number between 1 and 100.', ephemeral: true });
    }

    // Defer reply so we don't hit interaction timeout
    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.bulkDelete(amount, true);
      await interaction.editReply({ content: `✅ Successfully deleted ${messages.size} message(s).` });
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.editReply({ content: '❌ Failed to delete messages. Maybe the messages are too old (14+ days)?' });
    }
  }
};
