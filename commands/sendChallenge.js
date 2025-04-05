const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { challenge } = require("../challengeData");
const CHANNEL_ID = process.env.CHANNEL_ID;

module.exports = async (interaction) => {
  const member = await interaction.guild.members.fetch(interaction.user.id);
  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "Only admins can send the challenge.", ephemeral: true });
  }

  const type = interaction.options.getString("type");
  const targetChannel = interaction.options.getChannel("channel");
  const channel = targetChannel || interaction.client.channels.cache.get(CHANNEL_ID);

  if (!channel || !channel.isTextBased()) {
    return interaction.reply({ content: "⚠️ Channel not valid!", ephemeral: true });
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
    .setColor(type === "Daily" ? 0x00bfff : 0xffa500)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await interaction.reply({ content: `📢 Challenge sent to <#${channel.id}>!`, ephemeral: true });
};
