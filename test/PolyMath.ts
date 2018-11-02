const HDWalletProvider = require("truffle-hdwallet-provider");
import { assert } from "chai";
import * as moment from "moment";

import { deployPolymath } from "../src/PolyMath/Fixtures";
import { putInvestor } from "../src/PolyMath/Interface";
import { getInvestorFromWhitelist } from "../src/PolyMath/utils";

import * as PM from "polymathjs";
import * as Web3 from "web3";

import {
  Address,
  SecurityToken,
} from "../src/Types";
import * as PMT from "../src/PolyMath/Types";

const provider = new HDWalletProvider(
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
  "http://localhost:8545",
  0,
  10, // Number of accounts generated
);

const web3 = new Web3(provider);

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

      const investor1: PMT.Investor = {
        address: this.investoraddress1,
        international: false,
        kyc: true,
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
      assert(moment(whitelistedInvestor.expiry).isSame(moment().add(3, "months"), "days"));
      assert(moment(whitelistedInvestor.from).isSame(moment().add(1, "years"), "days"));
      assert(moment(whitelistedInvestor.to).isSame(moment(), "days"));
    });

    it("should be idempotent, does not update KYC or transfer validity dates on multiple calls", async function() {
      let whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.addedBy, this.controller);
      assert(moment(whitelistedInvestor.expiry).isSame(moment().add(3, "months"), "days"));
      assert(moment(whitelistedInvestor.from).isSame(moment().add(1, "years"), "days"));
      assert(moment(whitelistedInvestor.to).isSame(moment(), "days"));

      await putInvestor(this.investor1, this.investoraddress1, this.tokenAddress, this.cWeb3);

      whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
      assert.equal(whitelistedInvestor.addedBy, this.controller);
      assert(moment(whitelistedInvestor.expiry).isSame(moment().add(3, "months"), "days"));
      assert(moment(whitelistedInvestor.from).isSame(moment().add(1, "years"), "days"));
      assert(moment(whitelistedInvestor.to).isSame(moment(), "days"));
    });

    context("current KYC is in the past", async function() {
      before(async function() {
        // Stub the moment.diff function to allow us to move into the future
        this.oldDiffFunction = moment.fn.diff;
        moment.fn.diff = (a: any, b: any, c: any) => 1;
      });

      afterEach(function() {
        moment.fn.diff = this.oldDiffFunction;
      });

      it("should update KYC validity date to 3 months from now", async function() {
        let whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
        assert.equal(whitelistedInvestor.addedBy, this.controller);

        const investor1New: PMT.Investor = {
          address: this.investoraddress1,
          international: false,
          kyc: true,
        };

        await putInvestor(investor1New, this.investoraddress1, this.tokenAddress, this.cWeb3);
        whitelistedInvestor = await getInvestorFromWhitelist(this.transferManager, this.investoraddress1);
        assert(moment(whitelistedInvestor.expiry).isSame(moment().add(3, "months"), "days"));
      });

    });

    context("the country has changed from international to US", async function() {
      it("should remove investor", async function() {
        
      });
    })
  });
});
