const { SlashCommandBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");

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

    // Defer reply di awal
    await interaction.deferReply();

    // Pastikan user di voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.editReply({
        content: "❌ You need to join a voice channel first!",
        flags: 64, // Flag untuk menjadikan pesan hanya bisa dilihat oleh pengirim
      });
    }

    // Validasi YouTube URL
    if (!ytdl.validateURL(url)) {
      return interaction.editReply({
        content: "❌ Invalid YouTube URL.",
        flags: 64, // Flag untuk menjadikan pesan hanya bisa dilihat oleh pengirim
      });
    }

    try {
      // Mendapatkan stream audio dari URL YouTube
      const stream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
      });

      const resource = createAudioResource(stream, {
        inputType: AudioInputType.Opus, // Menentukan jenis input audio (opus untuk audio YouTube)
      });
      console.log("Audio Resource Created:", resource);

      const player = createAudioPlayer();
      player.play(resource);
      console.log("Audio player started");

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      console.log("Bot connected to voice channel.");

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("Player has finished playing, destroying connection.");
        connection.destroy();
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log("Voice connection is ready.");
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await entersState(connection, VoiceConnectionStatus.Ready, 5_000),  console.log("Voice connection was disconnected.");					;
        } catch {
          connection.destroy();
        }
      });

      // Setelah audio dimainkan, beri respon dengan editReply
      await interaction.editReply({
        content: `🎶 Now playing: ${url}`,
      });
    } catch (err) {
      console.error("Error playing audio:", err);
      await interaction.editReply({
        content: "❌ Failed to play the audio. Check the URL or try again.",
        flags: 64, // Flag untuk menjadikan pesan hanya bisa dilihat oleh pengirim
      });
    }
  },
};
