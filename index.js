const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");
const cron = require("node-cron");

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

let challenge = {
  Daily: {
    theme: "Default Daily Theme",
    vocab1: "VOCAB1",
    vocab2: "VOCAB2",
    vocab3: "VOCAB3",
    example: "Example sentences",
  },
  Weekly: {
    theme: "Default Weekly Theme",
  },
};

if (fs.existsSync("./challenges.json")) {
  const rawData = fs.readFileSync("./challenges.json");
  challenge = JSON.parse(rawData);
}

const updateChallengeCmd = new SlashCommandBuilder()
  .setName("update_challenge")
  .setDescription("Update daily or weekly challenge")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Challenge type")
      .setRequired(true)
      .addChoices(
        { name: "Weekly", value: "Weekly" },
        { name: "Daily", value: "Daily" }
      )
  )
  .addStringOption((option) =>
    option.setName("theme").setDescription("Challenge theme").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("vocab1").setDescription("Vocab 1 (Daily Only)")
  )
  .addStringOption((option) =>
    option.setName("vocab2").setDescription("Vocab 2 (Daily Only)")
  )
  .addStringOption((option) =>
    option.setName("vocab3").setDescription("Vocab 3 (Daily Only)")
  )
  .addStringOption((option) =>
    option.setName("example").setDescription("Example sentence (Daily Only)")
  );

const viewChallengeCmd = new SlashCommandBuilder()
  .setName("view_challenge")
  .setDescription("View current challenge")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Challenge type")
      .setRequired(true)
      .addChoices(
        { name: "Weekly", value: "Weekly" },
        { name: "Daily", value: "Daily" }
      )
  );

const sendChallengeCmd = new SlashCommandBuilder()
  .setName("send_challenge")
  .setDescription("Send current challenge to the channel")
  .addStringOption((option) =>
    option.setName("type").setRequired(true).addChoices(
      { name: "Weekly", value: "Weekly" },
      { name: "Daily", value: "Daily" }
    )
  )
  .addChannelOption((option) =>
    option.setName("channel").setDescription("Target channel")
  );

const sendKanaChallenge = new SlashCommandBuilder()
	.setName('sendKanaChallenge')
  .setDescription("Send Hiragana/Katakana Challenge")
  .addStringOption((option) =>
    option
      .setName("type")
      .setRequired(true)
      .addChoices(
        { name: "hiragana", value: "hiragana" },
        { name: "katakana", value: "katakana" }
      )
  )
  .addChannelOption((option) =>
    option.setName("channel").setDescription("Target channel")
  );

const commands = [
  updateChallengeCmd,
  viewChallengeCmd,
  sendChallengeCmd,
  sendKanaChallenge,
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  try {
    console.log("🔄 Registering slash commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log("✅ Slash commands registered!");
  } catch (error) {
    console.error("❌ Error registering commands:", error);
  }
})();

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

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

const cooldowns = new Map();

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;
  const now = Date.now();

  if (cooldowns.has(userId)) {
    if (now - cooldowns.get(userId) < 10000) return;
  }

  const msg = message.content.toLowerCase();
  const lang = detectLanguage(msg);

  if (lang === "JP") {
    const randomResponse =
      responsesJP[Math.floor(Math.random() * responsesJP.length)];
    message.reply(randomResponse);
    cooldowns.set(userId, now);
  } else if (lang === "EN") {
    const randomResponse =
      responsesEN[Math.floor(Math.random() * responsesEN.length)];
    message.reply(randomResponse);
    cooldowns.set(userId, now);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);

  if (interaction.commandName === "update_challenge") {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "Only admins can update the challenge.",
        ephemeral: true,
      });
    }

    const type = interaction.options.getString("type");
    challenge[type].theme = interaction.options.getString("theme");

    if (type === "Daily") {
      challenge[type].vocab1 =
        interaction.options.getString("vocab1") || "語彙1";
      challenge[type].vocab2 =
        interaction.options.getString("vocab2") || "語彙2";
      challenge[type].vocab3 =
        interaction.options.getString("vocab3") || "語彙3";
      challenge[type].example =
        interaction.options.getString("example") || "これは例文です。";
    }

    fs.writeFileSync("./challenges.json", JSON.stringify(challenge, null, 2));
    await interaction.reply(`✅ ${type} Challenge updated!`);
  }

  if (interaction.commandName === "view_challenge") {
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
      .setColor(type === "Daily" ? 0x00bfff : 0xffa500);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.commandName === "send_challenge") {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "Only admins can send the challenge.",
        ephemeral: true,
      });
    }

    const type = interaction.options.getString("type");
    const channel =
      interaction.options.getChannel("channel") ||
      client.channels.cache.get(CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: "⚠️ Channel not found or invalid!",
        ephemeral: true,
      });
    }

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
      .setColor(type === "Daily" ? 0x00bfff : 0xffa500);

    await channel.send({ embeds: [embed] });
    await interaction.reply({
      content: `📢 ${type} Challenge sent to <#${channel.id}>!`,
      ephemeral: true,
    });
  }
});

client.login(TOKEN);
