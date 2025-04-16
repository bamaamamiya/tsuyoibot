const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "./utils/grammarIndex.json");

function getGrammarIndex() {
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, JSON.stringify({ index: 0 }, null, 2));
    return 0;
  }
  const data = JSON.parse(fs.readFileSync(indexPath));
  return data.index;
}

function saveGrammarIndex(index) {
  fs.writeFileSync(indexPath, JSON.stringify({ index }, null, 2));
}

module.exports = { getGrammarIndex, saveGrammarIndex };
