const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("view_challenge")
    .setDescription("View current challenge")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Weekly", value: "Weekly" },
          { name: "Daily", value: "Daily" }
        )),
  
  async execute(interaction) {
    await interaction.reply("Here is the current challenge.");
  }
};
