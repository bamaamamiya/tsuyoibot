const { SlashCommandBuilder } = require("discord.js");

const updateChallengeCmd = new SlashCommandBuilder()
  .setName("update_challenge")
  .setDescription("Update a vocab challenge (Admin only)")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Choose Daily or Weekly challenge")
      .setRequired(true)
      .addChoices(
        { name: "Daily", value: "Daily" },
        { name: "Weekly", value: "Weekly" }
      )
  )
  .addStringOption((option) =>
    option.setName("theme").setDescription("Challenge theme").setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("vocab1").setDescription("Vocab 1 (Daily only)").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("vocab2").setDescription("Vocab 2 (Daily only)").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("vocab3").setDescription("Vocab 3 (Daily only)").setRequired(false)
  )
  .addStringOption((option) =>
    option.setName("example").setDescription("Example sentence (Daily only)").setRequired(false)
  );

const viewChallengeCmd = new SlashCommandBuilder()
  .setName("view_challenge")
  .setDescription("View the current vocab challenge")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Choose Daily or Weekly challenge")
      .setRequired(true)
      .addChoices(
        { name: "Daily", value: "Daily" },
        { name: "Weekly", value: "Weekly" }
      )
  );

const sendChallengeCmd = new SlashCommandBuilder()
  .setName("send_challenge")
  .setDescription("Send the current vocab challenge to a channel (Admin only)")
  .addStringOption((option) =>
    option
      .setName("type")
      .setDescription("Choose Daily or Weekly challenge")
      .setRequired(true)
      .addChoices(
        { name: "Daily", value: "Daily" },
        { name: "Weekly", value: "Weekly" }
      )
  )
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Channel to send the challenge to (optional)")
      .setRequired(false)
  );

module.exports = {
  updateChallengeCmd,
  viewChallengeCmd,
  sendChallengeCmd,
};
