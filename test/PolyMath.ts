const HDWalletProvider = require("truffle-hdwallet-provider");
import { assert } from "chai";
import * as moment from "moment";

import { deployPolymath } from "../src/PolyMath/Fixtures";
import { putInvestor } from "../src/PolyMath/Interface";

import * as PM from "polymathjs";
import { NetworkParams } from "polymathjs/types";
import * as Web3 from "web3";

import {
  Address,
  SecurityToken,
} from "../src/Types";

const provider = new HDWalletProvider(
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
  "http://localhost:8545",
  0,
  10, // Number of accounts generated
);

const web3 = new Web3(provider);

const getInvestorFromWhitelist = async (transferManager: any, address: Address) => {
  const whitelist = await transferManager.getWhitelist();
  return whitelist.filter((investor: any) => investor.address === address)[0];
};

describe("PolyMath interface", async () => {
  before(async function() {
    await web3.eth.getAccounts((error: any, accounts: any) => {
      this.controller = accounts[0];
      this.exchange = accounts[1];
    });

    this.cWeb3 = {
      controller: this.controller,
      gasPrice: async () => {
        return '5';
      },
      web3,
    };

    const networkParams = {
      account: this.controller, // transactions sender
      id: "*", // Local Network
      web3,
      web3WS: web3, // Web3 1.0 instance supplied with WebsocketProvider, it can be the same instance as the one above
      txHashCallback: (hash: Object) => {}, // receives a transaction hash every time one was generated
      txEndCallback: (receipt: Object) => {}, // receives a transaction receipt every time one was mined
    };

    PM.SecurityToken.setParams(networkParams);
  });

  after( () => {
    provider.engine.stop();
  });

  describe("deployPolymath", () => {
    it("should deploy a whitelisted token", async function() {
      const tokenAddress = await deployPolymath(this.controller, this.exchange, "regulated", web3);
      const securityToken = new PM.SecurityToken(tokenAddress);
      assert.equal(tokenAddress, await securityToken.address);
      assert.equal(this.controller, await securityToken.owner());
      assert.equal("CAP Token", await securityToken.name());
    });
  });

  describe("putInvestor", () => {
    before(async function() {
      await web3.eth.getAccounts((error: any, accounts: any) => {
        this.investoraddress1 = accounts[2];
        this.investoraddress2 = accounts[3];
      });

      const investor1: SecurityToken.Investor<Address> = {
        id: this.investoraddress1,
        kyc: {
          commitment: "something", // TODO: What is this supposed to be?
          expiration: new Date(2019, 10, 31),
        },
        accreditation: null, // TODO: Do we need to set this? If so, what?
        country: "United States",
      };

      this.investor1 = investor1;
      this.tokenAddress = await deployPolymath(this.controller, this.exchange, "regulated", web3);
      this.securityToken = new PM.SecurityToken(this.tokenAddress);
      this.transferManager = await this.securityToken.getTransferManager();
    });

    it("should accurately install an investor", async function() {
      const transcript = await putInvestor(this.investor1, this.investoraddress1, this.tokenAddress, this.cWeb3);
      const receipt = transcript[0];
      assert(receipt.description, "registers investor");
      assert.typeOf(receipt.hash, "string");

      const whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.addedBy, this.controller);
      assert.equal(whitelistedInvestor.expiry.getTime(), this.investor1.kyc.expiration.getTime());
    });

    it("should be idempotent", async function() {
      let whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.addedBy, this.controller);
      assert.equal(whitelistedInvestor.expiry.getTime(), this.investor1.kyc.expiration.getTime());

      const transcript2 = await putInvestor(this.investor1, this.investoraddress1, this.tokenAddress, this.cWeb3);
      const receipt = transcript2[0];
      assert(receipt.description, "registers investor");
      assert.typeOf(receipt.hash, "string");

      whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.addedBy, this.controller);
      assert.equal(whitelistedInvestor.expiry.getTime(), this.investor1.kyc.expiration.getTime());
    });

    it("should update user representation to token", async function() {
      let whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.expiry.getTime(), this.investor1.kyc.expiration.getTime());

      const investor1New: SecurityToken.Investor<Address> = {
        id: this.investoraddress1,
        kyc: {
          commitment: "something", // TODO: What is this supposed to be?
          expiration: new Date(2019, 11, 31),
        },
        accreditation: null, // TODO: Do we need to set this? If so, what?
        country: "United States",
      };

      await putInvestor(investor1New, this.investoraddress1, this.tokenAddress, this.cWeb3);
      whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.expiry.getTime(), investor1New.kyc!.expiration.getTime());
    });

    it("should detect non-KYC user", async function() {

    });
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
