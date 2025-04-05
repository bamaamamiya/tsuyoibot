const { detectLanguage, getResponse } = require("../utils/languageDetection");
const cooldowns = new Map();

module.exports = {
  name: "messageCreate",
  execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();

    if (cooldowns.has(userId) && now - cooldowns.get(userId) < 10000) return;

    const lang = detectLanguage(message.content);
    if (lang) {
      const response = getResponse(lang);
      message.reply(response);
      cooldowns.set(userId, now);
    }
  },
};
