// Polymath.js imports
import * as PM from "polymathjs";
import * as moment from "moment";

import { BigNumber } from "bignumber.js";
import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";
import { ConfiguredWeb3, txReceipt } from "../Web3";
import { getInvestorFromWhitelist } from "./utils";

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
  let pmInvestor: any;

  // If already whitelisted, disregard the from and to fields,
  // only update KYC is the current value is in the past, and set it to 3 months from now
  //
  // If the investor is not already on the whitelist, set some default values, and
  // in the future this could be configured via params to putInvestor
  if (whitelistedInvestor) {
    const expiry = (moment().diff(whitelistedInvestor.expiry, "days") > 0) ?
      moment().add(3, "months").toDate() :
      whitelistedInvestor.expiry;

    pmInvestor = {
      address: primaryWallet,
      from: whitelistedInvestor.from,
      to: whitelistedInvestor.to,
      expiry,
    };
  } else {
    pmInvestor = {
      address: primaryWallet,
      from: moment().add(1, "years").toDate(),
      to: new Date(),
      expiry: moment().add(3, "months").toDate(),
    };
  }

  const newInvestorTransaction: any = await transferManager.modifyWhitelist(pmInvestor);
  const investorReceipt = await receipt(newInvestorTransaction.transactionHash);
  appendToTranscript("registers investor", investorReceipt);

  return transcript;
}
