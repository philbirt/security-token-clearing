import { execSync } from "child_process";

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
  console.log("Getting POLY from faucet...");
  execSync("node CLI/polymath-cli faucet 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 200000", { cwd: "polymath-core" });

  console.log("Deploying Polymath STO & SecurityToken...");
  const deployOutput = execSync("node CLI/polymath-cli st20generator -c capped_sto_data.yml", { cwd: "polymath-core", timeout: 300000 }).toString();

  const securityTokenInitialDeployMatches: any = deployOutput.match(/Deployed Token at address: (.*)/);
  let securityTokenAddress;

  if (securityTokenInitialDeployMatches) {
    securityTokenAddress = securityTokenInitialDeployMatches[1];
  } else {
    // Security token has already been deployed
    const securityTokenAlreadyDeployedMatches: any = deployOutput.match(/Token has already been deployed at address (.*). Skipping registration/);
    securityTokenAddress = securityTokenAlreadyDeployedMatches[1];
  }

  return securityTokenAddress;
}

export const polymathUniverse = async (
  master: string,
  exchange: string,
  investors: PMExchange.Investor[],
  regime: "regulated" | "notRegulated",
  web3: Web3,
) => {
  const tokenAddress = await deployPolymath(master, exchange, regime, web3);
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
      // polymath.token.issueTokens(investor.address, 1e8, {
      //   from: master,
      //   gas: 2e6,
      // });

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
