const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a specific number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('target')
        .setDescription('Choose which messages to delete')
        .addChoices(
          { name: 'All messages', value: 'all' },
          { name: 'Only bots', value: 'bot' },
          { name: 'Only users', value: 'user' }
        )
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getString('target') || 'all';

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ You need to input a number between 1 and 100.', ephemeral: true });
    }

    // Defer reply
    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });

      // Filter berdasarkan target
      let filtered;
      if (target === 'bot') {
        filtered = messages.filter(msg => msg.author.bot).first(amount);
      } else if (target === 'user') {
        filtered = messages.filter(msg => !msg.author.bot).first(amount);
      } else {
        filtered = messages.first(amount);
      }

      const deleted = await interaction.channel.bulkDelete(filtered, true);

      await interaction.editReply({ content: `✅ Successfully deleted ${deleted.size} message(s) (${target}).` });
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.editReply({ content: '❌ Failed to delete messages. Maybe they are too old (14+ days)?' });
    }
  }
};
