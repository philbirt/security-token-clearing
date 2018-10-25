// Polymath.js imports
import * as PM from "polymathjs";
import { NetworkParams } from "polymathjs/types";

import { BigNumber } from "bignumber.js";
import { ConfiguredWeb3, txReceipt } from "../Web3";
import HDWalletProvider from "truffle-hdwallet-provider";
import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";
import * as w3u from "web3/lib/utils/utils";

// Security Token Clearing imports
import * as Interface from "../Interface";
import {
  Exchange,
  Receipt,
  ScopedCommitment,
  SecurityToken,
  Tagged,
  Transcript,
} from "../Types";

const toWei = (x: number | string | BigNumber, u: string) =>
  new BigNumber(w3u.toWei(x, u)).toString();

const web3 = new Web3(
  new HDWalletProvider(
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
    "http://localhost:8545",
  ),
);

const networkParams = {
  account: "0x627306090abab3a6e1400e9345bc60c78a8bef57", // transactions sender
  id: "*", // Kovan network id
  web3,
  web3WS: web3, // Web3 1.0 instance supplied with WebsocketProvider, it can be the same instance as the one above
  txHashCallback: (hash: Object) => console.log(hash), // receives a transaction hash every time one was generated
  txEndCallback: (receipt: Object) => console.log(receipt), // receives a transaction receipt every time one was mined
}

PM.Contract.setParams(networkParams);

export async function putInvestor(
  investor: SecurityToken.Investor<string>,
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
