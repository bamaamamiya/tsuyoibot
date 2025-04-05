const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Import grammar list & helpers
const grammarList = require("../data/grammarList.json"); // sesuaikan path
const { getGrammarIndex, saveGrammarIndex } = require("../utils/grammarUtils"); // helper untuk tracking index

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grammar")
    .setDescription("Show the Japanese Grammar of the Day (N5)"),
    
  async execute(interaction) {
    const grammarIndex = getGrammarIndex();
    const grammarItem = grammarList[grammarIndex];

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("📚 Japanese Grammar of the Day – N5")
      .addFields(
        { name: "Grammar", value: `**${grammarItem.grammar}**`, inline: false },
        { name: "Explanation", value: grammarItem.explanation, inline: false },
        { name: "Examples", value: grammarItem.examples.join("\n"), inline: false },
        { name: "Your Turn", value: "Try to make your own sentence using this grammar 👇", inline: false }
      )
      .setFooter({ text: "Daily Japanese | Keep learning one day at a time 💪" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Update index (optional — bisa diaktifkan jika kamu ingin next grammar tiap command)
    const nextIndex = (grammarIndex + 1) % grammarList.length;
    saveGrammarIndex(nextIndex);
  },
};
