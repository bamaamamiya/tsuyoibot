// commands/sapa.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sapa')
    .setDescription('Bot akan menyapamu'),
  async execute(interaction) {
    await interaction.reply('Hai, aku TsuyoiBot!');
  },
};
