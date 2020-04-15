const path = require("path");
const fs = require("fs"); //fs = file system module in nodejs lib
const solc = require("solc");

const lotteryPath = path.resolve(__dirname, "contracts", "Lottery.sol");
const source = fs.readFileSync(lotteryPath, "utf8"); //reading the content(raw source code) of the file Inbox.sol , utf8 is the encoding type of the file

//passing our source code to solc, 1 is the no of contracts we need to compile
module.exports = solc.compile(source, 1).contracts[":Lottery"];
