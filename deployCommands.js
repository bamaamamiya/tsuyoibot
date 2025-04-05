const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
const { updateChallengeCmd, viewChallengeCmd, sendChallengeCmd } = require("./commands/data");

dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("🔄 Registering slash commands...");
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [updateChallengeCmd, viewChallengeCmd, sendChallengeCmd].map((c) => c.toJSON()),
    });
    console.log("✅ Slash commands registered!");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
})();
