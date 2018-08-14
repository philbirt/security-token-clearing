import {
  Exchange,
  ScopedStatus,
  SecurityToken,
  Status,
  ScopedCommitment,
  Tagged,
  Transcript
} from "./Data";
import { ConfiguredWeb3 } from "./Web3";
import * as Web3 from "web3";

// ~~~~~~~~~~~~~~~~~~~~~~~~ //
// SECURITY TOKEN INTERFACE //
// ~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * (Pure) functions for working with security token data.
 */
export interface Utils<InvestorType, IdType> {
  /**
   * Compute the primary id to represent a user to the system, as well as a
   * secondary id that can be used to detect when the same user has joined more
   * than once with different government ids.
   */
  investorId: (investor: Exchange.Investor) => IdType;

  /**
   * Transform an exchange investor into a security token investor.
   */
  interpretInvestor: (
    investor: Exchange.Investor,
    kyc:
      | Tagged<"documents", Exchange.Documentation>
      | Tagged<"commitment", ScopedCommitment>
      | null,
    accreditation:
      | Tagged<"documents", Exchange.Documentation>
      | Tagged<"commitment", ScopedCommitment>
      | null
  ) => InvestorType;
}

/**
 * Impure functions for modifying Ethereum
 */
export interface Management<InvestorType, IdType> {
  /**
   * Leave the system in a state where the DS image of the investor is the same
   * as the given value.  This function should only update those values that
   * differ from the input.
   */
  putInvestor: (
    investor: InvestorType,
    primaryWallet: string,
    tokenAddress: string
  ) => Promise<Transcript>;

  /**
   * Approve an investor for KYC.  (Approvals should be valid for 3 months.)
   */
  approveKyc: (
    investorId: IdType,
    documents: Array<Buffer>,
    tokenAddress: string
  ) => Promise<Transcript>;

  /**
   * Mark an investor as accredited.
   */
  markAccredited: (
    investorId: IdType,
    documents: Array<Buffer>,
    tokenAddress: string
  ) => Promise<Transcript>;
}

/**
 * Impure functions for inspecting contract state
 */
export interface Inspection<InvestorType, IdType> {
  /**
   * Get all the data associated with a particular address
   */
  investorByAddress: (
    investorAddress: string,
    tokenAddress: string
  ) => Promise<InvestorType | null>;

  /**
   * Get all the data associated with a particular primary id
   */
  investorById: (
    investorId: IdType,
    tokenAddress: string
  ) => Promise<InvestorType | null>;

  /**
   * When all of the data for a transfer is known, test for an obstruction to
   * settling the transfer.
   */
  transferObstruction: (
    sourceAddress: string,
    destinationAddress: string,
    quanitity: number,
    tokenAddress: string
  ) => Promise<null | SecurityToken.TransferError>;

  /**
   * Test if there are obstructions to transfer at the token level.
   */
  tokenObstruction: (
    tokenAddress: string
  ) => Promise<null | SecurityToken.TransferError>;

  /**
   * Test if the buyer is _definitely not able_ to buy this quantity of the token.
   */
  buyerObstruction: (
    investorAddress: string,
    tokenAddress: string,
    quantity: number
  ) => Promise<null | SecurityToken.TransferError>;

  /**
   * Test if the seller is _definitely not able_ to sell this quantity of the token.
   */
  sellerObstruction: (
    investorAddress: string,
    tokenAddress: string,
    quantity: number
  ) => Promise<null | SecurityToken.TransferError>;
}

/**
 * Exchanges should implment a commit-reveal scheme
 */
export interface Committing<IdType> {
  /**
   * Create a commitment for some documentation
   */
  commit: (docs: Exchange.Documentation) => ScopedCommitment;
  /**
   * Retrieve the documents that are represented by a commitment.
   */
  openCommitment: (
    commitment: string,
    investorId: IdType
  ) => Promise<Exchange.Documentation | null>;
}

/**
 * Each security token platform should implement a value of Tradable type.
 */
export interface Tradable<InvestorType, IdType> {
  management: (cWeb3: ConfiguredWeb3) => Management<InvestorType, IdType>;
  inspection: (
    controller: string,
    web3: Web3
  ) => Inspection<InvestorType, IdType>;
  utils: Utils<InvestorType, IdType>;
}

/**
 * To facilitate testing, a security token platform should also implement the Testable type.
 */
export interface Testable<InvestorType, IdType>
  extends Tradable<InvestorType, IdType> {
  /**
   * This function should create a `Universe` value representing a *fresh*
   * deployment of security tokens, configured to match the `Unviverse`.
   */
  universe: (
    master: string,
    exchange: string,
    investors: Array<Exchange.Investor>,
    web3: Web3
  ) => Promise<Testing.Universe>;
}
