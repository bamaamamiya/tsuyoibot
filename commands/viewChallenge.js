const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs/promises");
const path = require("path");
// config/challenges.js

module.exports = {
  data: new SlashCommandBuilder()
    .setName("view_challenge")
    .setDescription("View the current Daily or Weekly vocab challenge")
    .addStringOption(option =>
      option
        .setName("type")
        .setDescription("Choose challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Daily", value: "Daily" },
          { name: "Weekly", value: "Weekly" }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type");

    const data = await fs.readFile(
      path.join(__dirname, "../data/challenges.json"),
      "utf8"
    );
    const challenge = JSON.parse(data);
    const current = challenge[type];

    const embed = new EmbedBuilder()
      .setTitle(`📌 ${type} Vocab Challenge`)
      .addFields(
        { name: "📚 Theme", value: current.theme, inline: false },
        ...(type === "Daily"
          ? [
              { name: "1️⃣ Vocab 1", value: current.vocab1, inline: true },
              { name: "2️⃣ Vocab 2", value: current.vocab2, inline: true },
              { name: "3️⃣ Vocab 3", value: current.vocab3, inline: true },
              { name: "📝 Example", value: current.example, inline: false },
            ]
          : [])
      )
      .setColor(type === "Daily" ? 0x00bfff : 0xffa500)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};