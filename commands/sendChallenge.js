const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");
const CHANNEL_ID = process.env.CHANNEL_ID; // Tambahkan ini di .env jika belum


const challenge = {
  Daily: {
    theme: "Daily Theme dari Admin",
    vocab1: "単語1",
    vocab2: "単語2",
    vocab3: "単語3",
    example: "Contoh kalimat dari admin.",
  },
  Weekly: {
    theme: "Weekly Theme dari Admin",
  },
};

module.exports = challenge;
module.exports = {
  data: new SlashCommandBuilder()
    .setName("send_challenge")
    .setDescription("Send the daily or weekly vocab challenge to a specific channel")
    .addStringOption(option =>
      option.setName("type")
        .setDescription("Challenge type")
        .setRequired(true)
        .addChoices(
          { name: "Weekly", value: "Weekly" },
          { name: "Daily", value: "Daily" }
        )
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send the challenge (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const member = interaction.member;

    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "❌ Only admins can send the challenge.",
        ephemeral: true,
      });
      return;
    }

    const type = interaction.options.getString("type");
    const targetChannel = interaction.options.getChannel("channel");
    const channel = targetChannel || interaction.client.channels.cache.get(CHANNEL_ID);

    console.log(
      `🔎 Selected Channel: ${targetChannel ? targetChannel.id : "None"}, Fallback: ${CHANNEL_ID}`
    );

    if (!challenge[type]) {
      await interaction.reply({
        content: "⚠️ Invalid challenge type!",
        ephemeral: true,
      });
      return;
    }

    if (!channel || !channel.isTextBased()) {
      await interaction.reply({
        content: "⚠️ Channel not found or invalid!",
        ephemeral: true,
      });
      return;
    }

    const current = challenge[type];

    try {
      await interaction.deferReply({ ephemeral: true });

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

      await channel.send({ embeds: [embed] });

      await interaction.editReply(`📢 ${type} Challenge sent to <#${channel.id}>!`);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      await interaction.editReply({
        content: "❌ Failed to send the challenge. Please check the channel and try again.",
        ephemeral: true,
      });
    }
  }
};
