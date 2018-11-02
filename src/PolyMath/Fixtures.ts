import { execSync } from "child_process";

import * as moment from "moment";
import * as PM from "polymathjs";
import * as Web3 from "web3";

import {
  Exchange,
  Portfolio,
  ScopedCommitment,
  Tagged,
  Testing,
} from "../Types";

import { putInvestor } from "./Interface";

export async function deployPolymath(
  controller: string,
  exchange: string,
  complianceType: "notRegulated" | "whitelisted" | "regulated",
  web3: Web3,
) {
  // Retrive POLY from the faucet
  execSync("node CLI/polymath-cli faucet 0x627306090abaB3A6e1400e9345bC60c78a8BEf57 200000", { cwd: "polymath-core" });
  // Deploy a SecurityToken & STO
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
  investors: Exchange.Investor[],
  regime: "regulated" | "notRegulated",
  web3: Web3,
) => {
  const tokenAddress = await deployPolymath(master, exchange, regime, web3);
  const portfolio: Map<string, number> = new Map([["CAP", 2000]]);
  const testingInvestors: Testing.Investor[] = await Promise.all(
    //
    // TODO: Determine if we need to use this configuration per investor,
    //       or if we can just use a multimint configuration when using the CLI script.
    //
    investors.map(async (investor) => {
      console.log(`Configuring investor ${investor.primaryWallet}`);

      //
      // TODO: Removed the first argument of the interface, we likely need to keep it
      //       to conform to the overall interface
      //
      // await putInvestor(investor.primaryWallet, tokenAddress, {
      //   controller: master,
      //   gasPrice: async () => {
      //     return 5;
      //   },
      //   web3,
      // });

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
        portfolio,
        kyc: null,
        accreditation: null,
      };
    }),
  );
  const u: Testing.Universe = {
    investors: testingInvestors,
    tokens: new Map([
      ["CAP", { description: "CAP Token", precision: 6, symbol: "CAP", address: tokenAddress }],
    ]),
  };
  return u;
};
