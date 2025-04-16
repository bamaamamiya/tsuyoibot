const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const grammarList = require("../data/grammarListUlti.json");
const { getGrammarIndex, saveGrammarIndex } = require("../utils/grammarUtils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grammar")
    .setDescription("Show the Japanese Grammar of the Day")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // hanya admin

  async execute(interaction) {
    const grammarIndex = getGrammarIndex();
    const grammarItem = grammarList[grammarIndex];

    // Gunakan level dari data
    const level = grammarItem.level || "N5"; // fallback ke N5 kalau belum ada

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`📚 Japanese Grammar of the Day – ${level}`)
      .addFields(
        { name: "Grammar", value: `**${grammarItem.grammar}**`, inline: false },
        { name: "Explanation", value: grammarItem.explanation, inline: false },
        { name: "Examples", value: grammarItem.examples.join("\n"), inline: false },
        { name: "Your Turn", value: "Try to make your own sentence using this grammar 👇", inline: false }
      )
      .setFooter({ text: "Daily Japanese | Keep learning one day at a time 💪" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Save next index
    const nextIndex = (grammarIndex + 1) % grammarList.length;
    saveGrammarIndex(nextIndex);
  },
};
