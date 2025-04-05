// commands/update_challenge.js
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const draftPath = path.join(__dirname, "../data/challenges_draft.json");
const challengeDraft = require(draftPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update_challenge")
    .setDescription("Update challenge (saved as draft)")
    .addStringOption(option =>
      option.setName("type").setDescription("Challenge type").setRequired(true)
        .addChoices(
          { name: "Daily", value: "Daily" },
          { name: "Weekly", value: "Weekly" }
        )
    )
    .addStringOption(option => option.setName("theme").setDescription("Challenge theme").setRequired(true))
    .addStringOption(option => option.setName("vocab1").setDescription("Vocab 1 (Daily)").setRequired(false))
    .addStringOption(option => option.setName("vocab2").setDescription("Vocab 2 (Daily)").setRequired(false))
    .addStringOption(option => option.setName("vocab3").setDescription("Vocab 3 (Daily)").setRequired(false))
    .addStringOption(option => option.setName("example").setDescription("Example sentence").setRequired(false)),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: "❌ Admins only!", ephemeral: true });
    }

    const type = interaction.options.getString("type");
    challengeDraft[type].theme = interaction.options.getString("theme");

    if (type === "Daily") {
      challengeDraft[type].vocab1 = interaction.options.getString("vocab1") || "語彙1";
      challengeDraft[type].vocab2 = interaction.options.getString("vocab2") || "語彙2";
      challengeDraft[type].vocab3 = interaction.options.getString("vocab3") || "語彙3";
      challengeDraft[type].example = interaction.options.getString("example") || "これは例文です。";
    }

    fs.writeFileSync(draftPath, JSON.stringify(challengeDraft, null, 2));

    await interaction.reply({
      content: `✅ Draft for **${type}** challenge saved!`,
      ephemeral: true,
    });
  }
};
