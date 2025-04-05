const { PermissionsBitField } = require("discord.js");
const { challenge, saveChallenges } = require("../challengeData");

module.exports = async (interaction) => {
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "Only admins can update.", ephemeral: true });
  }

  const type = interaction.options.getString("type");
  challenge[type].theme = interaction.options.getString("theme");

  if (type === "Daily") {
    challenge[type].vocab1 = interaction.options.getString("vocab1") || "語彙1";
    challenge[type].vocab2 = interaction.options.getString("vocab2") || "語彙2";
    challenge[type].vocab3 = interaction.options.getString("vocab3") || "語彙3";
    challenge[type].example = interaction.options.getString("example") || "これは例文です。";
  }

  saveChallenges();
  await interaction.reply(`✅ ${type} Challenge updated!`);
};
