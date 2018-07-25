import {
  Exchange,
  ScopedStatus,
  SecurityToken,
  Status,
  Transcript
} from "./Data";
import { ConfiguredWeb3 } from "./Web3";

// ~~~~~~~~~~~~~~~~~~~~~~~~ //
// SECURITY TOKEN INTERFACE //
// ~~~~~~~~~~~~~~~~~~~~~~~~ //

/**
 * Compute the primary id to represent a user to the system, as well as a
 * secondary id that can be used to detect when the same user has joined more
 * than once with different government ids.
 */
declare function investorId(
  investor: Exchange.Investor
): SecurityToken.Identifier;

/**
 * Get all the data associated with a particular address
 */
declare function investorByAddress(
  investorAddress: string,
  tokenAddress: string,
  cweb3: ConfiguredWeb3
): Promise<SecurityToken.Investor | null>;

/**
 * Get all the data associated with a particular primary id
 */
declare function investorById(
  investorId: string,
  tokenAddress: string,
  cweb3: ConfiguredWeb3
): Promise<SecurityToken.Investor | null>;

/**
 * Transform an exchange investor into a security token investor.
 */
declare function interpretInvestor(
  investor: Exchange.Investor,
  kyc: Exchange.Documentation | null,
  accreditation: Exchange.Documentation | null
): SecurityToken.Investor;

/**
 * Leave the system in a state where the DS image of the investor is the same
 * as the given value.  This function should only update those values that
 * differ from the input.
 */
declare function putInvestor(
  investor: SecurityToken.Investor,
  cweb3: ConfiguredWeb3
): Promise<Transcript>;

/**
 * Approve an investor for KYC.  (Approvals should be valid for 3 months.)
 */
declare function approveKyc(
  investorId: string,
  documents: Array<Buffer>,
  tokenAddress: string,
  cweb3: ConfiguredWeb3
): Promise<Transcript>;

/**
 * Mark an investor as accredited.
 */
declare function markAccredited(
  investorId: string,
  documents: Array<Buffer>,
  tokenAddress: string,
  cweb3: ConfiguredWeb3
): Promise<Transcript>;

/**
 * Simulate a transfer to see if it is inhibited.  This call _must not_ consume ether.
 */
declare function simulateTransfer(
  sourceAddress: string,
  destinationAddress: string,
  quanitity: number,
  tokenAddress: string,
  cweb3: ConfiguredWeb3
): Promise<null | SecurityToken.TransferError>;

/**
 * Test if the buyer is _definitely not able_ to buy this quantity of the token.
 */
declare function ruleOutBuyer(
  investorAddress: string,
  tokenAddress: string,
  quantity: number,
  cweb3: ConfiguredWeb3
): Promise<null | SecurityToken.TransferError>;

/**
 * Test if the seller is _definitely not able_ to sell this quantity of the token.
 */
declare function ruleOutSeller(
  investorAddress: string,
  tokenAddress: string,
  quantity: number,
  cweb3: ConfiguredWeb3
): Promise<null | SecurityToken.TransferError>;
