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

    // ✅ Check user is in a voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to join a voice channel first!",
        ephemeral: true,
      });
    }

    // ✅ Validate YouTube URL
    if (!play.yt_validate(url)) {
      return interaction.reply({
        content: "❌ Invalid YouTube URL.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      // ✅ Get stream
      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      const player = createAudioPlayer();

      // ✅ Join voice channel
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      // ✅ Wait until connection is ready
      await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
      connection.subscribe(player);

      // ✅ Play the resource
      player.play(resource);

      // ✅ Cleanup after playback ends
      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      // ✅ Log errors
      player.on("error", (err) => {
        console.error("Audio Player Error:", err);
      });

      await interaction.editReply({
        content: `🎶 Now playing: ${url}`,
      });
    } catch (err) {
      console.error("❌ Error playing audio:", err);
      await interaction.editReply({
        content: "❌ Failed to play the audio. Please check the link or try again.",
      });
    }
  },
};
