const fs = require("fs");

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

module.exports = { challenge, saveChallenges };
