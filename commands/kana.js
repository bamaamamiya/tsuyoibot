const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const hiragana = [
  "あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ", "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の", "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も", "や", "ゆ", "よ", "ら", "り",
  "る", "れ", "ろ", "わ", "を", "ん",
];

const katakana = [
  "ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ",
  "サ", "シ", "ス", "セ", "ソ", "タ", "チ", "ツ", "テ", "ト",
  "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ",
  "マ", "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ",
  "ル", "レ", "ロ", "ワ", "ヲ", "ン",
];

function getRandomKana(list) {
  const shuffled = [...list].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5); // ambil 5 random
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kana")
    .setDescription("Get today's random Japanese Kana characters"),
    
  async execute(interaction) {
    const randomHiragana = getRandomKana(hiragana);
    const randomKatakana = getRandomKana(katakana);

    const embed = new EmbedBuilder()
      .setColor(0x7d7270)
      .setTitle("🎌 Japanese Letters Today")
      .addFields(
        { name: "Hiragana", value: randomHiragana.join(" "), inline: false },
        { name: "Katakana", value: randomKatakana.join(" "), inline: false }
      )
      .setTimestamp()
      .setDescription(
        "**Tips:**\n<@&1352807726731759730>\nTry combining letters if you can't guess just one.\nType what you already know.\nKeep learning every day 💪"
      );

    await interaction.reply({ embeds: [embed] });
  },
};
