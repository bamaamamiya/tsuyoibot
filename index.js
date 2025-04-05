require("dotenv").config();
const { Client, GatewayIntentBits, Events } = require("discord.js");
const {
  updateChallengeCmd,
  viewChallengeCmd,
  sendChallengeCmd,
} = require("./commands/data");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const challengeData = {
  title: "",
  description: "",
  image: "",
};

client.once(Events.ClientReady, () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === updateChallengeCmd.name) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const image = interaction.options.getString("image");

    challengeData.title = title;
    challengeData.description = description;
    challengeData.image = image;

    await interaction.reply({
      content: "✅ Challenge updated successfully!",
      flags: 64,
    });
  }

  else if (commandName === viewChallengeCmd.name) {
    if (!challengeData.title) {
      return interaction.reply({
        content: "⚠️ No challenge has been set yet.",
        flags: 64,
      });
    }

    await interaction.reply({
      embeds: [
        {
          title: challengeData.title,
          description: challengeData.description,
          image: {
            url: challengeData.image,
          },
          color: 0x00b0f4,
        },
      ],
      flags: 64,
    });
  }

  else if (commandName === sendChallengeCmd.name) {
    if (!challengeData.title) {
      return interaction.reply({
        content: "⚠️ No challenge has been set yet.",
        flags: 64,
      });
    }

    await interaction.reply({
      content: "📢 Challenge sent to this channel!",
      flags: 64,
    });

    await interaction.channel.send({
      embeds: [
        {
          title: challengeData.title,
          description: challengeData.description,
          image: {
            url: challengeData.image,
          },
          color: 0x00b0f4,
        },
      ],
    });
  }
});

client.login(process.env.BOT_TOKEN);
