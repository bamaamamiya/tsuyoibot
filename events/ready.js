const cron = require("node-cron");
const fs = require("fs/promises");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { getGrammarIndex, saveGrammarIndex } = require("../utils/grammarUtils");

// Kana data
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
  return shuffled.slice(0, 5);
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    const grammarChannelId = "1357907121739530321";
    const kanaChannelId = "1357906897675616276";

    const grammarChannel = await client.channels.fetch(grammarChannelId);
    const kanaChannel = await client.channels.fetch(kanaChannelId);

    // ─── Daily Grammar @ 19:00 WIB (12:00 UTC) ───
    cron.schedule("0 12 * * *", async () => {
      try {
        const grammarListRaw = await fs.readFile(path.join(__dirname, "../data/grammarList.json"), "utf8");
        const grammarList = JSON.parse(grammarListRaw);
        const grammarIndex = getGrammarIndex();
        const grammarItem = grammarList[grammarIndex];

        const grammarEmbed = new EmbedBuilder()
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

        await grammarChannel.send({ embeds: [grammarEmbed] });

        const nextIndex = (grammarIndex + 1) % grammarList.length;
        saveGrammarIndex(nextIndex);
        console.log("📤 Sent grammar of the day");
      } catch (err) {
        console.error("❌ Failed to send grammar of the day:", err);
      }
    });

    // ─── Daily Kana @ 19:00 WIB (12:00 UTC) ───
    cron.schedule("0 12 * * *", async () => {
      try {
        const randomHiragana = getRandomKana(hiragana);
        const randomKatakana = getRandomKana(katakana);

        const kanaEmbed = new EmbedBuilder()
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

        await kanaChannel.send({ embeds: [kanaEmbed] });
        console.log("📤 Sent kana of the day");
      } catch (err) {
        console.error("❌ Failed to send kana of the day:", err);
      }
    });
  },
};
