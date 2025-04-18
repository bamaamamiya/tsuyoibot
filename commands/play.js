const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const play = require("play-dl"); // play-dl library to fetch streams
const ytdl = require('ytdl-core'); // ytdl-core for YouTube video fetching

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

    // Log the URL received
    console.log("URL received:", url);

    // Ensure user is in a voice channel
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        content: "❌ You need to join a voice channel first!",
        ephemeral: true,
      });
    }

    // Check if the URL is valid
    if (!play.yt_validate(url)) {
      return interaction.reply({
        content: "❌ Invalid YouTube URL.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      // Try fetching the stream with play-dl
      const { stream, format } = await play.stream(url);
      console.log("Stream fetched with play-dl:", stream);
      console.log("Stream format:", format);

      const resource = createAudioResource(stream.stream, {
        inputType: stream.type, // Make sure input type is valid
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
        console.log("Audio finished, disconnecting...");
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
      console.error("Error while playing audio with play-dl:", err);

      // If play-dl fails, try using ytdl-core as a fallback
      try {
        console.log("Falling back to ytdl-core");

        const stream = ytdl(url, { filter: 'audioonly' });
        const resource = createAudioResource(stream, { inputType: 'opus' });

        const player = createAudioPlayer();

        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        connection.subscribe(player);
        player.play(resource);

        player.on(AudioPlayerStatus.Idle, () => {
          console.log("Audio finished, disconnecting...");
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
        console.error("Error with ytdl-core:", err);
        await interaction.editReply({
          content: "❌ Failed to play the audio. Check the URL or try again.",
        });
      }
    }
  },
};
