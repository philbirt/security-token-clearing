/**
 * ISO 3166-1 alpha-2 country code
 */
export type Country = string;

/**
 * The portfolio should be keyed by token addresses.
 */
export type Portfolio = Map<string, number>;

/**
 * The possible statuses for user KYC etc.
 */
export type Status = "none" | "approved" | "rejected";

/**
 * A status which is only valid until an expiration date.
 */
export interface ScopedStatus {
  expiration: Date;
  status: Status;
}

/**
 * A commitment to a value, with an expiration.
 */
export interface ScopedCommitment {
  commitment: string;
  expiration: Date;
}

/**
 * Use this to tag parts of a discriminated union.
 */
export type Tagged<Tag, X> = X & { tag: Tag };

/**
 * The hash of transaction published to the chain
 */
export type TransactionHash = string;

/**
 * A simplified and streamlined version of the transaction receipt.
 */
export interface Receipt {
  hash: TransactionHash;
  description: string;
  gas: number;
}

/**
 * The outcome of running a sequence of mutations on Ethereum.
 */
export type Transcript = Array<Receipt>;

export namespace SecurityToken {
  /**
   * An identifier that can be used to detect when the same user has registered
   * more than once.
   */
  export interface Identifier {
    primary: string;
    secondary: string;
  }
  /**
   * An investor from the permissioned token's point of view
   */
  export interface Investor {
    id: Identifier;
    kyc: ScopedCommitment & { type: "kyc" } | null;
    accreditation: ScopedCommitment & { type: "accreditation" } | null;
    country: Country | null;
  }
  /**
   * Possible reasons that a transfer could fail.
   */
  export type TransferError =
    | "buyer.kyc"
    | "buyer.accreditation"
    | "seller.kyc"
    | "seller.insufficientFunds"
    | "holdingPeriodActive"
    | "maximumShareholdersExceeded";
}

export namespace Exchange {
  /**
   * An investor from the exchange point of view
   */
  export interface Investor {
    fullName: string;
    dateOfOrigin: Date;
    governmentId: string;
    primaryWallet: string;
    country: Country;
  }
  /**
   * Documentation consists of a time-scoped collection of document binaries
   * with human readable annotations.
   *
   * NOTE: the cannonical ordering on documents binaries is the ascending
   * bytestring order.
   */
  export interface Documentation {
    documents: Array<[string, Buffer]>;
    expiration: Date;
  }
}

/**
 * A varied fixture dataset illustrating the possibilities for DS.  This
 * fixture set should make it easier to test integrations.
 */
export namespace Testing {
  /**
   * When working with tokens it is helpful to have a description of each
   * deployed token.
   */
  export interface Token {
    address: string;
    description: string;
  }
  /**
   * A very complete `Investor` type suitable for testing.
   */
  export interface Investor extends Exchange.Investor {
    portfolio: Portfolio;
    kyc: Exchange.Documentation | null;
    accreditation: Exchange.Documentation | null;
  }
  /**
   * A realistic snapshot of what the ecosystem may contain.
   */
  export interface Universe {
    /**
     * A token for each different configuration of rules, etc. `tokens` should be
     * keyed by token symbol.
     */
    tokens: Map<string, Token>;
    /**
     * Sample investors, including their balances
     */
    investors: Array<[Investor]>;
  }
}
