import { TransactionReceipt } from "ethereum-types";
import * as Web3 from "web3";

export interface ConfiguredWeb3 {
  web3: Web3;
  /**
   * A mechanism to provide a reasonable gas price in gwei
   */
  gasPrice: () => Promise<number>;
  /**
   * This address is used to send transactions.
   */
  controller: string;
}

/**
 * Retrieve the receipt associated to a transaction using the persistent strategy.
 */
export async function txReceipt(
  txHash: string,
  web3: Web3
): Promise<TransactionReceipt> {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      web3.eth.getTransactionReceipt(
        txHash,
        (err: Error, receipt: TransactionReceipt | null) => {
          if (err !== null) {
            reject(err);
          } else if (receipt !== null) {
            resolve(receipt);
          } else {
            setTimeout(attempt, 1e3);
          }
        }
      );
    };
    attempt();
  }) as Promise<TransactionReceipt>;
}

/**
 * Embed a web3 in a closure that can be used to get many receipts.
 */
export function receiptsRetriever(
  web3: Web3
): (hashes: Array<string>) => Promise<Array<TransactionReceipt>> {
  return async hashes => Promise.all(hashes.map(hash => txReceipt(hash, web3)));
}

/**
 * Comprehension of success field for ganache-cli, geth. and parity
 */
export function success(txr: TransactionReceipt): boolean {
  return txr.status === 1 || txr.status === "0x1" || txr.status === "0x01";
}
