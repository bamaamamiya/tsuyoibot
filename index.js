const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID, CATEGORY_ID } = require('./config.json');
const fs = require('fs');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Load challenge.json
const challenge = JSON.parse(fs.readFileSync('./challenge.json', 'utf8'));

// Register commands
const commands = [
  new SlashCommandBuilder()
    .setName('show_challenge')
    .setDescription('Show the current challenge')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of challenge')
        .setRequired(true)
        .addChoices(
          { name: 'Daily', value: 'Daily' },
          { name: 'Weekly', value: 'Weekly' },
        )),
  new SlashCommandBuilder()
    .setName('send_challenge')
    .setDescription('Send challenge to specific channel')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of challenge')
        .setRequired(true)
        .addChoices(
          { name: 'Daily', value: 'Daily' },
          { name: 'Weekly', value: 'Weekly' },
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Target channel')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('send_challenge_to_category')
    .setDescription('Send challenge to all channels in category')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of challenge')
        .setRequired(true)
        .addChoices(
          { name: 'Daily', value: 'Daily' },
          { name: 'Weekly', value: 'Weekly' },
        )),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Command Handlers
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'show_challenge') {
    const type = interaction.options.getString('type');
    const current = challenge[type];

    const embed = new EmbedBuilder()
      .setTitle(`📌 ${type} Vocab Challenge`)
      .addFields(
        { name: "📚 Theme", value: current.theme, inline: false }
      )
      .setColor(0x00AE86);

    if (type === "Daily") {
      embed.addFields(
        { name: "🌐 Vocab 1", value: current.vocab1, inline: true },
        { name: "🌐 Vocab 2", value: current.vocab2, inline: true },
        { name: "🌐 Vocab 3", value: current.vocab3, inline: true },
        { name: "🌟 Example Sentence", value: current.example, inline: false }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'send_challenge') {
    const type = interaction.options.getString('type');
    const targetChannel = interaction.options.getChannel('channel');

    if (!targetChannel.isTextBased()) {
      await interaction.reply({
        content: "❌ Target channel must be a text-based channel.",
        ephemeral: true,
      });
      return;
    }

    const current = challenge[type];

    const embed = new EmbedBuilder()
      .setTitle(`📌 ${type} Vocab Challenge`)
      .addFields(
        { name: "📚 Theme", value: current.theme, inline: false }
      )
      .setColor(0x00AE86);

    if (type === "Daily") {
      embed.addFields(
        { name: "🌐 Vocab 1", value: current.vocab1, inline: true },
        { name: "🌐 Vocab 2", value: current.vocab2, inline: true },
        { name: "🌐 Vocab 3", value: current.vocab3, inline: true },
        { name: "🌟 Example Sentence", value: current.example, inline: false }
      );
    }

    await targetChannel.send({ embeds: [embed] });
    await interaction.reply(`✅ ${type} Challenge sent to ${targetChannel}`);
  }

  if (interaction.commandName === 'send_challenge_to_category') {
    const type = interaction.options.getString('type');
    const category = interaction.guild.channels.cache.get(CATEGORY_ID);

    if (!category || category.type !== 4) { // 4 = GuildCategory
      await interaction.reply({
        content: "❌ Invalid CATEGORY_ID or category not found.",
        ephemeral: true,
      });
      return;
    }

    const current = challenge[type];

    const embed = new EmbedBuilder()
      .setTitle(`📌 ${type} Vocab Challenge`)
      .addFields(
        { name: "📚 Theme", value: current.theme, inline: false }
      )
      .setColor(0x00AE86);

    if (type === "Daily") {
      embed.addFields(
        { name: "🌐 Vocab 1", value: current.vocab1, inline: true },
        { name: "🌐 Vocab 2", value: current.vocab2, inline: true },
        { name: "🌐 Vocab 3", value: current.vocab3, inline: true },
        { name: "🌟 Example Sentence", value: current.example, inline: false }
      );
    }

    let successCount = 0;

    category.children.cache.forEach(channel => {
      if (channel.isTextBased()) {
        channel.send({ embeds: [embed] }).then(() => {
          successCount++;
        }).catch(err => console.error(`Failed to send to ${channel.name}:`, err));
      }
    });

    await interaction.reply(`✅ ${type} Challenge sent to ${successCount} channels in category.`);
  }
});

client.login(TOKEN);
