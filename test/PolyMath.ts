const HDWalletProvider = require("truffle-hdwallet-provider");
import assert = require('assert');

import { deployPolymath } from "../src/PolyMath/Fixtures";
import * as PM from "polymathjs";
import { NetworkParams } from "polymathjs/types";
import * as Web3 from "web3";

const provider = new HDWalletProvider(
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
    "http://localhost:8545",
  );

const web3 = new Web3(provider);
const controller = web3.eth.accounts[0];
const exchange = web3.eth.accounts[1];

const cWeb3 = {
  controller: "master",
  gasPrice: async () => {
    return 5;
  },
  web3,
};

const networkParams = {
  account: "0x627306090abab3a6e1400e9345bc60c78a8bef57", // transactions sender
  id: "*", // Local Network
  web3,
  web3WS: web3, // Web3 1.0 instance supplied with WebsocketProvider, it can be the same instance as the one above
  txHashCallback: (hash: Object) => console.log(hash), // receives a transaction hash every time one was generated
  txEndCallback: (receipt: Object) => console.log(receipt), // receives a transaction receipt every time one was mined
};

PM.SecurityToken.setParams(networkParams);

describe("PolyMath interface", () => {
  it("should deploy a whitelisted token", async () => {
    const address = await deployPolymath(controller, exchange, "regulated", web3);
    return assert.ok(address);
  });

  describe("putInvestor", () => {
    it("should accurately install an investor", async function() {});
    it("should be idempotent", async function() {});
    it("should update user representation to token");
    it("should detect non-KYC user");
  });

  describe("transferObstruction", () => {
    it("should allow an OK trade", async function() {});
    it("should detect shareholder limit violation");

    describe("failing trades", async function() {
      it("should fail a trade when the buyer is not OK for REG S");
      it("should fail a trade when the seller is not OK for REG S");
    });
  });
});
