// commands/send_challenge.js
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const draftPath = path.join(__dirname, "../data/challenges_draft.json");
const activePath = path.join(__dirname, "../data/challenges.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send_challenge")
    .setDescription("Publish the draft challenge (Admins only)")
    .addStringOption(option =>
      option.setName("type").setDescription("Challenge type").setRequired(true)
        .addChoices(
          { name: "Daily", value: "Daily" },
          { name: "Weekly", value: "Weekly" }
        )
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ Admins only!", ephemeral: true });
    }

    const type = interaction.options.getString("type");
    const draft = require(draftPath);
    const current = require(activePath);

    current[type] = draft[type];
    fs.writeFileSync(activePath, JSON.stringify(current, null, 2));

    await interaction.reply({
      content: `✅ ${type} challenge has been published from draft!`,
      ephemeral: true,
    });
  }
};
