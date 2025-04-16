const fs = require("fs");
const path = require("path");

function getGrammarIndex() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "grammarIndexUlti.json"));
    const parsed = JSON.parse(data);
    return parsed.index;
  } catch (err) {
    console.error("Error reading grammar index:", err);
    return 0;
  }
}

function saveGrammarIndex(index) {
  try {
    fs.writeFileSync(
      path.join(__dirname, "grammarIndex.json"),
      JSON.stringify({ index })
    );
  } catch (err) {
    console.error("Error saving grammar index:", err);
  }
}

module.exports = { getGrammarIndex, saveGrammarIndex };