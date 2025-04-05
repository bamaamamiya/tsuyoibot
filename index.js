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
    example: "Example senteces",
  },
  Weekly: {
    theme: "Default Weekly Theme",
  },
};

if (fs.existsSync("./challenges.json")) {
  const rawData = fs.readFileSync("./challenges.json");
  challenge = JSON.parse(rawData);
}

// === Commands ===

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
    option
      .setName("vocab1")
      .setDescription("Vocab 1 (Daily Only)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("vocab2")
      .setDescription("Vocab 2 (Daily Only)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("vocab3")
      .setDescription("Vocab 3 (Daily Only)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("example")
      .setDescription("Example sentence (Daily Only)")
      .setRequired(false)
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
    option
      .setName("type")
      .setDescription("Challenge type")
      .setRequired(true)
      .addChoices(
        { name: "Weekly", value: "Weekly" },
        { name: "Daily", value: "Daily" }
      )
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Channel to send the challenge to")
      .setRequired(false)
  );

const commands = [updateChallengeCmd, viewChallengeCmd, sendChallengeCmd].map(
  (cmd) => cmd.toJSON()
);

// === Register Commands ===
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

// === Event Handling ===



client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

const cooldowns = new Map(); // Untuk mencegah spam

// Daftar sapaan dalam bahasa Inggris dan Jepang
const greetingsEN = ["hello", "hi", "hey", "yo", "sup"];
const responsesEN = ["Hello there! 😊", "Hey! How’s your day going?", "Yo! Wassup?", "Hi! Hope you're doing great!"];

const greetingsJP = ["こんにちは", "おはよう", "やあ", "もしもし","ohayou"];
const responsesJP = ["こんにちは！🌸", "やあ！元気？", "おはよう！✨", "もしもし！📞"];

// Fungsi untuk mendeteksi bahasa
function detectLanguage(message) {
	if (greetingsJP.some(greet => message.trim() === greet)) return "JP";
	if (greetingsEN.some(greet => message.trim() === greet)) return "EN";
	
    return null;
}

// Event ketika ada pesan masuk
client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;
    const now = Date.now();

    // Cek cooldown (3 detik)
    if (cooldowns.has(userId)) {
        const lastUsed = cooldowns.get(userId);
        if (now - lastUsed < 10000) return; // Jangan balas kalau masih dalam cooldown
    }

    const msg = message.content.toLowerCase();
    const lang = detectLanguage(msg);

    if (lang === "JP") {
        const randomResponse = responsesJP[Math.floor(Math.random() * responsesJP.length)];
        message.reply(randomResponse);
        cooldowns.set(userId, now); // Set cooldown
    } else if (lang === "EN") {
        const randomResponse = responsesEN[Math.floor(Math.random() * responsesEN.length)];
        message.reply(randomResponse);
        cooldowns.set(userId, now); // Set cooldown
    }
});




client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const member = await interaction.guild.members.fetch(interaction.user.id);

  if (interaction.commandName === "update_challenge") {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "Only admins can update the challenge.",
        ephemeral: true,
      });
      return;
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
    await interaction.reply(
      `✅ ${type} Challenge updated! Theme: ${challenge[type].theme}`
    );
  }

  if (interaction.commandName === "view_challenge") {
    const type = interaction.options.getString("type");
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
  }

  if (interaction.commandName === "send_challenge") {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "Only admins can send the challenge.",
        ephemeral: true,
      });
      return;
    }

    const type = interaction.options.getString("type");
    const targetChannel = interaction.options.getChannel("channel"); // Get selected channel
    const channel = targetChannel || client.channels.cache.get(CHANNEL_ID); // Use selected or fallback

    console.log(
      `🔎 Selected Channel: ${
        targetChannel ? targetChannel.id : "None"
      }, Fallback: ${CHANNEL_ID}`
    );

    // Validasi tipe challenge
    if (!challenge[type]) {
      await interaction.reply({
        content: "⚠️ Invalid challenge type!",
        ephemeral: true,
      });
      return;
    }

    const current = challenge[type];

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({
        content: "⚠️ Channel not found or invalid!",
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.deferReply({ ephemeral: true }); // Menghindari timeout jika proses lama

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

      await channel.send({ embeds: [embed] }); // Mengirim pesan ke channel

      await interaction.editReply(
        `📢 ${type} Challenge sent to <#${channel.id}>!`
      );
    } catch (error) {
      console.error("❌ Error sending message:", error);
      await interaction.editReply({
        content: "⚠️ Failed to send message. Please check bot permissions!",
      });
    }
  }
});

// === Daily Kana Logic ===
const kanaPairs = [
  { kana: "あ", katakana: "ア" },
  { kana: "い", katakana: "イ" },
  { kana: "う", katakana: "ウ" },
  { kana: "え", katakana: "エ" },
  { kana: "お", katakana: "オ" },
  { kana: "か", katakana: "カ" },
  { kana: "き", katakana: "キ" },
  { kana: "く", katakana: "ク" },
  { kana: "け", katakana: "ケ" },
  { kana: "こ", katakana: "コ" },
  { kana: "さ", katakana: "サ" },
  { kana: "し", katakana: "シ" },
  { kana: "す", katakana: "ス" },
  { kana: "せ", katakana: "セ" },
  { kana: "そ", katakana: "ソ" },
  // Tambah kalau perlu...
];

function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
  h = (h << 13) | (h >>> 19);
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function sfc32(a, b, c, d) {
  return function () {
    a |= 0; b |= 0; c |= 0; d |= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21 | c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}

function getKanaLineForToday() {
  const today = new Date().toISOString().split("T")[0];
  const seed = xmur3(today);
  const rand = sfc32(seed(), seed(), seed(), seed());

  const useHiragana = rand() > 0.5;
  const shuffled = [...kanaPairs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, 5);
  const line = selected.map(k => useHiragana ? k.kana : k.katakana).join("・");

  return {
    line,
    type: useHiragana ? "Hiragana" : "Katakana"
  };
}

// === Export Slash Command
module.exports = {
  data: new SlashCommandBuilder()
    .setName("dailykana")
    .setDescription("Get 5 Random (hiragana/katakana) everyday!"),

  async execute(interaction) {
    const { line, type } = getKanaLineForToday();

    const embed = new EmbedBuilder()
      .setTitle("📖 Kana of the Day")
      .setDescription(`**${line}**`)
      .setColor(0xF67280)
      .setFooter({ text: `Tipe: ${type} ・ ${new Date().toLocaleDateString("ja-JP")}` });

    await interaction.reply({ embeds: [embed] });
  }
};

client.on("error", console.error);
client.login(TOKEN);
