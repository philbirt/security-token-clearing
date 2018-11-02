/**
 * An investor from the permissioned token's point of view
 */
export interface Investor {
  address: string;
  international: boolean;
  kyc: boolean;
}
