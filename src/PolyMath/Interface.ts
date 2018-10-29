// Polymath.js imports
import * as PM from "polymathjs";

import { BigNumber } from "bignumber.js";
import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";
import * as w3u from "web3/lib/utils/utils";
import { ConfiguredWeb3, txReceipt } from "../Web3";

// Security Token Clearing imports
import * as Interface from "../Interface";
import {
  Receipt,
  ScopedCommitment,
  SecurityToken,
  Tagged,
  Transcript,
} from "../Types";

import {
  PMExchange,
} from "./Types";

const toWei = (x: number | string | BigNumber, u: string) =>
  new BigNumber(w3u.toWei(x, u)).toString();

export async function putInvestor(
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

  const pmInvestor: any = {
    address: primaryWallet,
  };
  const newInvestor: SecurityToken.Investor<string> = await transferManager.modifyWhitelist(pmInvestor);

  // const receipt = await receipt(
  //   registry.registerInvestor(id, "", {
  //     from: controller,
  //     gas: 3e5,
  //     gasPrice
  //   })
  // );
  // appendToTranscript("registers investor", receipt);

  console.log(securityToken);
  console.log(newInvestor);

  return transcript;
}
