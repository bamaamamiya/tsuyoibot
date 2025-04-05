const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send_challenge")
    .setDescription("Send current challenge to the channel")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Weekly", value: "Weekly" },
          { name: "Daily", value: "Daily" }
        ))
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send the challenge to")
        .setRequired(false)),
  
  async execute(interaction) {
    await interaction.reply("Challenge sent!");
  }
};
