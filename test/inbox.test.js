const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require("../compile"); //interface and bytecode are two main properties we get from 'Inbox' when we compile it using solc

let accounts;
let inbox;

beforeEach(async () => {
  //Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  //Use one of those accounts to deploy
  //the contract
  inbox = await new web3.eth.Contract(JSON.parse(interface)) //Teaches web3 about what methods an Inbox contracts has  |   first argument to Contract constructor is the ABI, when the solc compiled our contract, it spitted out a JSON representation of our interface, but since we want to pass a JS object and not JSON, we parsed the JSON to get back JS object
    .deploy({
      data: bytecode,
      arguments: ["Hi there!"],
    }) //TELLS web3 THAT WE WANT TO DEPLOY A NEW COPY OF THIS CONTRACT |   deploy takes the compiled contract bytecode and the list of arguments that the contract constructor fxn expects
    .send({
      from: accounts[0],
      gas: "1000000",
    }); //INSTRUCTS web3 TO SEND OUT A TRNSXN THAT CREATES THIS CONTRACT |   accounts[0] is deploying our contract with the given gas limit

  inbox.setProvider(provider);
});

describe("Inbox", () => {
  it("deploys a contract", () => {
    assert.ok(inbox.options.address);
  });

  it("has a default message", async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, "Hi there!");
  });

  it("can change the message", async () => {
    await inbox.methods.setMessage("bye").send({ from: accounts[0] });

    const message = await inbox.methods.message().call();
    assert.equal(message, "bye");
  });
});

// class Car {
//   park() {
//     return "stopped";
//   }

//   drive() {
//     return "vroom";
//   }
// }

// let car;

// beforeEach(() => {
//   car = new Car();
// });

// describe("Car", () => {
//   it("can park", () => {
//     assert.equal(car.park(), "stopped");
//   });

//   it("can drive", () => {
//     assert.equal(car.drive(), "vroom");
//   });
// });
