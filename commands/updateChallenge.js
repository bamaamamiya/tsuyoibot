const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update_challenge")
    .setDescription("Update daily or weekly challenge")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Weekly", value: "Weekly" },
          { name: "Daily", value: "Daily" }
        ))
    .addStringOption(option =>
      option.setName("theme").setDescription("Challenge theme").setRequired(true))
    .addStringOption(option =>
      option.setName("vocab1").setDescription("Vocab 1 (Daily Only)").setRequired(false))
    .addStringOption(option =>
      option.setName("vocab2").setDescription("Vocab 2 (Daily Only)").setRequired(false))
    .addStringOption(option =>
      option.setName("vocab3").setDescription("Vocab 3 (Daily Only)").setRequired(false))
    .addStringOption(option =>
      option.setName("example").setDescription("Example sentence (Daily Only)").setRequired(false)),
  
  async execute(interaction) {
    await interaction.reply("Challenge updated!");
  }
};
