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

  const securityTokenInitialDeployMatches = deployOutput.match(/Deployed Token at address: (.*)/);
  let securityTokenAddress;

  if (securityTokenInitialDeployMatches == null) {
    // Security token has already been deployed
    const securityTokenAlreadyDeployedMatches = deployOutput.match(/Token has already been deployed at address (.*). Skipping registration/);

    if (securityTokenAlreadyDeployedMatches == null) {
      throw new Error("Deployment address not found!");
    } else {
      securityTokenAddress = securityTokenAlreadyDeployedMatches[1];
    }
  } else {
    securityTokenAddress = securityTokenInitialDeployMatches[1];
  }

  return securityTokenAddress;
}
