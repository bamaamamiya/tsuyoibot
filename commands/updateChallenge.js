const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const challengePath = path.join(__dirname, "../data/challenges.json");

const challenge = require(challengePath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update_challenge")
    .setDescription("Update daily or weekly challenge")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Weekly", value: "Weekly" },
          { name: "Daily", value: "Daily" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("theme")
        .setDescription("Challenge theme")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("vocab1")
        .setDescription("Vocab 1 (Daily Only)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("vocab2")
        .setDescription("Vocab 2 (Daily Only)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("vocab3")
        .setDescription("Vocab 3 (Daily Only)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("example")
        .setDescription("Example sentence (Daily Only)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.member;

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "❌ Only admins can update the challenge.",
        ephemeral: true,
      });
      return;
    }

    const type = interaction.options.getString("type");
    challenge[type].theme = interaction.options.getString("theme");

    if (type === "Daily") {
      challenge[type].vocab1 =
        interaction.options.getString("vocab1") || "語彙1";
      challenge[type].vocab2 =
        interaction.options.getString("vocab2") || "語彙2";
      challenge[type].vocab3 =
        interaction.options.getString("vocab3") || "語彙3";
      challenge[type].example =
        interaction.options.getString("example") || "これは例文です。";
    }

    fs.writeFileSync(challengePath, JSON.stringify(challenge, null, 2));
    delete require.cache[require.resolve(challengePath)]; // clear cache
		
    await interaction.reply({
      content: `✅ ${type} Challenge updated!\n**Theme**: ${challenge[type].theme}`,
      ephemeral: true,
    });
  },
};
