const updateChallenge = require("../commands/updateChallenge");
const viewChallenge = require("../commands/viewChallenge");
const sendChallenge = require("../commands/sendChallenge");

module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === "update_challenge")
      return updateChallenge(interaction);

    if (interaction.commandName === "view_challenge")
      return viewChallenge(interaction);

    if (interaction.commandName === "send_challenge")
      return sendChallenge(interaction);
  },
};
