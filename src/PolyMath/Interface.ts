// Polymath.js imports
import * as PM from "polymathjs";

import { BigNumber } from "bignumber.js";
import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";
import * as w3u from "web3-utils";
import { ConfiguredWeb3, txReceipt } from "../Web3";

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

const toWei = (x: number | string | BigNumber, u: string) =>
  new BigNumber(w3u.toWei(x, u)).toString();

export async function putInvestor(
  investor: SecurityToken.Investor<Address>,
  primaryWallet: string,
  tokenAddr: string,
  cWeb3: ConfiguredWeb3,
): Promise<Transcript> {
  const { controller, web3 } = cWeb3;
  const gasPrice = toWei(await cWeb3.gasPrice(), "gwei");

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

  // TODO: Understand the from, to paramaters, pass in the investor object
  const pmInvestor: any = {
    address: primaryWallet,
    from: new Date(),
    to: new Date(),
    expiry: investor.kyc!.expiration,
    canBuyFromSTO: true,
  };

  const newInvestorTransaction: any = await transferManager.modifyWhitelist(pmInvestor);
  const investorReceipt = await receipt(newInvestorTransaction.transactionHash);
  appendToTranscript("registers investor", investorReceipt);

  return transcript;
}
