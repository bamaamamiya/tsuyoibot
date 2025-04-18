const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const play = require("play-dl");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a YouTube video in voice channel.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("YouTube video URL")
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString("url");

    // Pastikan user di voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to join a voice channel first!",
        ephemeral: true,
      });
    }

    // Cek apakah URL valid
    if (!play.yt_validate(url)) {
      return interaction.reply({
        content: "❌ Invalid YouTube URL.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const { stream, format } = await play.stream(url);
      console.log("Stream fetched:", stream);
      console.log("Format:", format);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      const player = createAudioPlayer();

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
        } catch {
          connection.destroy();
        }
      });

      await interaction.editReply({
        content: `🎶 Now playing: ${url}`,
      });
    } catch (err) {
      console.error("Error playing audio:", err);
      await interaction.editReply({
        content: "❌ Failed to play the audio. Check the URL or try again.",
      });
    }
  },
};
