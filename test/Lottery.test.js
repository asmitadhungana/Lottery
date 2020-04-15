const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    //then we should be able to call the showplayers fxn
    const players = await lottery.methods.showPlayers().call({
      from: accounts[0],
    });

    //the 1st element in the players array must have the 1st(entering) account
    assert.equal(accounts[0], players[0]);

    //the length of players array must be 1
    assert.equal(1, players.length);
  });

  it("allows multiple players' accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });

    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    //then we should be able to call the showplayers fxn
    const players = await lottery.methods.showPlayers().call({
      from: accounts[0],
    });

    // the address in the players and accounts address must be equal
    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);

    //the length of players array must be 3
    assert.equal(3, players.length);
  });

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0,
      });
      assert(false); //if we get to this line of code, automatically fail the test i.e. if error isn't throwm by try block
    } catch (err) {
      assert.ok(err);
    }
  });

  it("only manager can call pickWinner fxn", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("sends money to the winner and resets the players array", async () => {
    //idea is to enter only one player in the arr and make him the winner (which he automatically becomes)
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("1", "ether"),
    });

    //check if he received the winning money by checking his balances before and after pickWinner() is calles
    const initialBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({ from: accounts[0] });

    const finalBalance = await web3.eth.getBalance(accounts[0]);

    const difference = finalBalance - initialBalance;

    //The difference should be slightly less than 1 ether (coz of dedxn in gas fee)
    assert(difference > web3.utils.toWei("0.8", "ether"));
  });
});
