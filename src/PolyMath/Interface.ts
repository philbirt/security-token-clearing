// Polymath.js imports
import * as PM from "polymathjs";

import { BigNumber } from "bignumber.js";
import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";
import { ConfiguredWeb3, txReceipt } from "../Web3";
import { getInvestorFromWhitelist, buildInvestor } from "./utils";

// Security Token Clearing imports
import * as Interface from "../Interface";
import {
  Address,
  Exchange,
  Receipt,
  ScopedCommitment,
  SecurityToken,
  Tagged,
  Transcript,
} from "../Types";
import * as PMT from "./Types";

export async function putInvestor(
  investor: PMT.Investor,
  primaryWallet: string,
  tokenAddr: string,
  cWeb3: ConfiguredWeb3,
): Promise<Transcript> {
  const { controller, web3 } = cWeb3;

  const transcript: Receipt[] = [];
  const appendToTranscript = (description: string, r: TransactionReceipt) => {
    transcript.push({
      description,
      gas: r.gasUsed,
      hash: r.transactionHash,
    });
  };
  const receipt = (hash: string) => txReceipt(hash, web3);

  const securityToken: any = new PM.SecurityToken(tokenAddr);
  const transferManager: any = await securityToken.getTransferManager();

  const whitelistedInvestor = await getInvestorFromWhitelist(transferManager, investor.address);
  const pmInvestor = buildInvestor(investor, whitelistedInvestor);

  if (pmInvestor != null) {
    const newInvestorTransaction: any = await transferManager.modifyWhitelist(pmInvestor);
    const investorReceipt = await receipt(newInvestorTransaction.transactionHash);
    appendToTranscript("registers investor", investorReceipt);
  }

  return transcript;
}
