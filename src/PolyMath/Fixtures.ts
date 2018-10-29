import * as moment from "moment";
import * as PM from "polymathjs";
import * as Web3 from "web3";

import {
  Portfolio,
  ScopedCommitment,
  Tagged,
} from "../Types";

import {
  PMExchange,
  PMTesting,
  PMSecurityToken,
} from "./Types";

import { putInvestor } from "./Interface";

export async function deployPolymath(
  controller: string,
  exchange: string,
  complianceType: "notRegulated" | "whitelisted" | "regulated",
  web3: Web3,
) {
  console.log("Deploying polymath...");

  //
  // TODO: Leverage the CLI here:
  // {
  //   tokenConfig: { name: "Polymath Token", symbol: "PMTT", divisible: false, },
  //   mintingConifg: {
  //      multimint: true,
  //      // Requires "./CLI/data/multi_mint_data.csv" with whitelist data, which
  //      // will likely be a detriment for moving polymath-core into an npm module
  //      // Unable to pass file path as an argument
  //   },
  //   stoConfig: {
  //      type: "Capped",
  //      cap: 500000,
  //      startTime: , // Uses unix epoch time
  //      endTime: , // Uses unix epoch time
  //      wallet: "",
  //      raiseType: "E"
  //   },
  // }
  //

  return {
    token: {
      address: "",
      issueTokens: (a: any, b: any, c: any) => { console.log("issueTokens"); },
    },
  };
}

export const polymathUniverse = async (
  master: string,
  exchange: string,
  investors: PMExchange.Investor[],
  regime: "regulated" | "notRegulated",
  web3: Web3,
) => {
  const polymath = await deployPolymath(master, exchange, regime, web3);
  const tokenAddress = polymath.token.address;

  // TODO: Do we need to use this exchange documentation for polymath?
  //
  // const expiration = moment()
  //   .add(30, "days")
  //   .toDate();
  // const mockDocs: Exchange.Documentation = {
  //   documents: [["passport", Buffer.from("abcdef")]],
  //   expiration,
  // };

  const portfolio: Map<string, number> = new Map([["PTOKEN", 2000]]);
  const testingInvestors: PMTesting.Investor[] = await Promise.all(
    //
    // TODO: Determine if we need to use this configuration per investor,
    //       or if we can just use a multimint configuration when using the CLI script.
    //
    investors.map(async (investor) => {
      console.log(`Configuring investor ${investor.address}`);

      //
      // TODO: Removed the first argument of the interface, we likely need to keep it
      //       to conform to the overall interface
      //
      await putInvestor(investor.address, tokenAddress, {
        controller: master,
        gasPrice: async () => {
          return 5;
        },
        web3,
      });

      console.log("Issuing tokens");

      //
      // TODO: Determine if this can go away with a multimint configuration
      //
      polymath.token.issueTokens(investor.address, 1e8, {
        from: master,
        gas: 2e6,
      });

      return {
        ...investor,
      };
    }),
  );
  const u: PMTesting.Universe = {
    investors: testingInvestors,
    tokens: new Map([
      ["PTOKEN", { description: "Polymath Token", precision: 6, symbol: "PMTT", address: tokenAddress }],
    ]),
  };
  return u;
};
