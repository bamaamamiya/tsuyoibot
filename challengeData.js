const fs = require("fs");
const path = require("path");

const challengeFilePath = path.join(__dirname, "challenge.json");
let challengeData = {};

// Saat bot pertama jalan, coba load file-nya
if (fs.existsSync(challengeFilePath)) {
  const fileData = fs.readFileSync(challengeFilePath, "utf8");
  challengeData = JSON.parse(fileData);
}



let challenge = {
  Daily: {
    theme: "Default Daily Theme",
    vocab1: "VOCAB1",
    vocab2: "VOCAB2",
    vocab3: "VOCAB3",
    example: "Example sentences",
  },
  Weekly: {
    theme: "Default Weekly Theme",
  },
};

if (fs.existsSync("./challenges.json")) {
  const rawData = fs.readFileSync("./challenges.json");
  challenge = JSON.parse(rawData);
}

function saveChallenges() {
  fs.writeFileSync("./challenges.json", JSON.stringify(challenge, null, 2));
}

if (commandName === updateChallengeCmd.name) {
  const title = interaction.options.getString("title");
  const description = interaction.options.getString("description");
  const image = interaction.options.getString("image");

  challengeData.title = title;
  challengeData.description = description;
  challengeData.image = image;

  saveChallengeData(); // <- simpan ke file

  await interaction.reply({
    content: "✅ Challenge updated successfully!",
    flags: 64,
  });
}
module.exports = { challenge, saveChallenges };
