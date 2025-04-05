const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grammar")
    .setDescription("Show today's Japanese grammar (N5 level)"),

  async execute(interaction) {
    await interaction.reply("今日の文法: ～です");
  }
};
