const { EmbedBuilder } = require("discord.js");
const { challenge } = require("../challengeData");

module.exports = async (interaction) => {
  const type = interaction.options.getString("type");
  const current = challenge[type];

  const embed = new EmbedBuilder()
    .setTitle(`📌 ${type} Vocab Challenge`)
    .addFields(
      { name: "📚 Theme", value: current.theme },
      ...(type === "Daily"
        ? [
            { name: "1️⃣ Vocab 1", value: current.vocab1 },
            { name: "2️⃣ Vocab 2", value: current.vocab2 },
            { name: "3️⃣ Vocab 3", value: current.vocab3 },
            { name: "📝 Example", value: current.example },
          ]
        : [])
    )
    .setColor(type === "Daily" ? 0x00bfff : 0xffa500)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
};
