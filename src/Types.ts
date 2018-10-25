/**
 * An Ethereum address
 */
export type Address = string;

/**
 * ISO 3166-1 alpha-2 country code
 */
export type Country = string;

/**
 * The portfolio should be keyed by token addresses.
 */
export type Portfolio = Map<Address, number>;

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

/**
 * Possible exemption types for a security which trades in the US
 */
export type ExemptionType = "rega" | "regcf" | "regd" | "regds" | "regs";

export namespace SecurityToken {
  /**
   * An investor from the permissioned token's point of view
   */
  export interface Investor<IdType> {
    id: IdType;
    kyc: ScopedCommitment | null;
    accreditation: ScopedCommitment | null;
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
   * NOTE: the canonical ordering on documents binaries is the ascending
   * bytestring order.
   */
  export interface Documentation {
    documents: Array<[string, Buffer]>;
    expiration: Date;
  }
  /**
   * The exchange view of the token should include the exemption type and some
   * parameters.
   */
  export interface BaseToken {
    address: Address;
    description?: string;
    precision: number;
    symbol: string;
  } 
  export interface RegDToken extends BaseToken {
    exemptionType: "regd";
    params: { 
      isFund: boolean; 
      holdingPeriodEnd: Date; 
    }
  }
  export interface RegDSToken extends BaseToken {
    exemptionType: "regds";
    params: { 
      isFund: boolean; 
      holdingPeriodEnd: Date; 
    }
  }
  export type Token = RegDToken | RegDSToken | (BaseToken & { exemptionType: "rega" | "regcf" | "regs" });
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
    address: Address;
    symbol: string;
    precision: number;
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
    tokens: Map<Address, Token>;
    /**
     * Sample investors, including their balances
     */
    investors: Array<Investor>;
  }
}
