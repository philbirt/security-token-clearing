import {
  Address,
} from "../Types";

export const getInvestorFromWhitelist = async (transferManager: any, address: Address) => {
  const whitelist = await transferManager.getWhitelist();
  return whitelist.filter((investor: any) => investor.address === address)[0];
};
