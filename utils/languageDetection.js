const greetingsEN = ["hello", "hi", "hey", "yo", "sup"];
const greetingsJP = ["こんにちは", "おはよう", "やあ", "もしもし", "ohayou"];

const responsesEN = [
  "Hello there! 😊",
  "Hey! How’s your day going?",
  "Yo! Wassup?",
  "Hi! Hope you're doing great!",
];

const responsesJP = [
  "こんにちは！🌸",
  "やあ！元気？",
  "おはよう！✨",
  "もしもし！📞",
];

function detectLanguage(message) {
  const msg = message.trim().toLowerCase();
  if (greetingsJP.some(g => msg === g)) return "JP";
  if (greetingsEN.some(g => msg === g)) return "EN";
  return null;
}

function getResponse(lang) {
  const list = lang === "JP" ? responsesJP : responsesEN;
  return list[Math.floor(Math.random() * list.length)];
}

module.exports = { detectLanguage, getResponse };
