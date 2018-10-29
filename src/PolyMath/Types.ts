import {
  Address,
  Testing,
} from '../Types';

export namespace PMSecurityToken {
  /**
   * An investor from the permissioned token's point of view
   */
  export interface Investor<IdType> {
    id: IdType;
    address: string;
    international: boolean;
  }
}

export namespace PMExchange {
  /**
   * An investor from the exchange point of view
   */
  export interface Investor {
    address: string;
    international: boolean;
  }
}

/**
 * A varied fixture dataset illustrating the possibilities for DS.  This
 * fixture set should make it easier to test integrations.
 */
export namespace PMTesting {
  /**
   * A very complete `Investor` type suitable for testing.
   */
  export interface Investor extends PMExchange.Investor {}

  /**
   * A realistic snapshot of what the ecosystem may contain.
   */
  export interface Universe {
    /**
     * A token for each different configuration of rules, etc. `tokens` should be
     * keyed by token symbol.
     */
    tokens: Map<Address, Testing.Token>;
    /**
     * Sample investors, including their balances
     */
    investors: Array<Investor>;
  }
}
