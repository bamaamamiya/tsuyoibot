const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[WARNING] Command at ${filePath} is missing "data" or "execute".`);
  }
}

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// === Greeting Auto-Reply ===
const cooldowns = new Map();
const greetingsEN = ["hello", "hi", "hey", "yo", "sup"];
const responsesEN = [
  "Hello there! 😊",
  "Hey! How’s your day going?",
  "Yo! Wassup?",
  "Hi! Hope you're doing great!",
];
const greetingsJP = ["こんにちは", "おはよう", "やあ", "もしもし", "ohayou"];
const responsesJP = [
  "こんにちは！🌸",
  "やあ！元気？",
  "おはよう！✨",
  "もしもし！📞",
];

function detectLanguage(message) {
  if (greetingsJP.some((greet) => message.trim() === greet)) return "JP";
  if (greetingsEN.some((greet) => message.trim() === greet)) return "EN";
  return null;
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();
  if (cooldowns.has(userId)) {
    const lastUsed = cooldowns.get(userId);
    if (now - lastUsed < 10000) return;
  }

  const msg = message.content.toLowerCase();
  const lang = detectLanguage(msg);

  if (lang === "JP") {
    const randomResponse = responsesJP[Math.floor(Math.random() * responsesJP.length)];
    message.reply(randomResponse);
    cooldowns.set(userId, now);
  } else if (lang === "EN") {
    const randomResponse = responsesEN[Math.floor(Math.random() * responsesEN.length)];
    message.reply(randomResponse);
    cooldowns.set(userId, now);
  }
});

// === Handle Slash Command ===
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on("error", console.error);
client.login(TOKEN);
