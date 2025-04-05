const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kana")
    .setDescription("Send 5 Letters hiragana dan katakana"),

  async execute(interaction) {
    await interaction.reply("あいうえお & アイウエオ");
  }
};
