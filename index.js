const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionsBitField,
} = require("discord.js");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // Guild ID for faster command sync
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
    vocab1: "語彙1",
    vocab2: "語彙2",
    vocab3: "語彙3",
    example: "これは例文です。",
  },
  Weekly: {
    theme: "Default Weekly Theme",
    vocab1: "語彙1",
    vocab2: "語彙2",
    vocab3: "語彙3",
    example: "これは例文です。",
  },
};

if (fs.existsSync("./challenges.json")) {
  const rawData = fs.readFileSync("./challenges.json");
  challenge = JSON.parse(rawData);
}

const commands = [
  new SlashCommandBuilder()
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
      option
        .setName("theme")
        .setDescription("Challenge theme")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("vocab1").setDescription("Vocab 1").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("vocab2").setDescription("Vocab 2").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("vocab3").setDescription("Vocab 3").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("example")
        .setDescription("Example sentence")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
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
    ),

  new SlashCommandBuilder()
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
    ),
].map((command) => command.toJSON());

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

client.on("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
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

    const type = interaction.options.getString("type"); // Daily or Weekly
    challenge[type].theme = interaction.options.getString("theme");
    challenge[type].vocab1 = interaction.options.getString("vocab1");
    challenge[type].vocab2 = interaction.options.getString("vocab2");
    challenge[type].vocab3 = interaction.options.getString("vocab3");
    challenge[type].example = interaction.options.getString("example");

    fs.writeFileSync("./challenges.json", JSON.stringify(challenge, null, 2));

    await interaction.reply(
      `✅ ${type} Challenge updated!\nTheme: ${challenge[type].theme}`
    );
  } else if (interaction.commandName === "view_challenge") {
    const type = interaction.options.getString("type");
    const current = challenge[type];
    const message = `\n**📌 Current ${type} Vocab Challenge**\n**Theme:** ${current.theme}\n\n1️⃣ ${current.vocab1}\n2️⃣ ${current.vocab2}\n3️⃣ ${current.vocab3}\n\n**Example:**\n${current.example}`;
    await interaction.reply({ content: message, ephemeral: true });
  } else if (interaction.commandName === "send_challenge") {
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "Only admins can send the challenge.",
        ephemeral: true,
      });
      return;
    }
    const type = interaction.options.getString("type"); // <-- Ambil pilihan
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (channel) {
      const message = `\n**📌 ${type} Vocab Challenge**\n**Theme:** ${challenge.theme}\n\n1️⃣ ${challenge.vocab1}\n2️⃣ ${challenge.vocab2}\n3️⃣ ${challenge.vocab3}\n\n**Example:**\n${challenge.example}`;
      channel.send(message);
      await interaction.reply(`📢 ${type} Challenge sent to channel!`);
    } else {
      await interaction.reply("⚠️ Channel not found!");
    }
  }
});

client.on("error", console.error);

client.login(TOKEN);
