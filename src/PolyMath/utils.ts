import * as moment from "moment";

import {
  Address,
} from "../Types";

import * as PMT from "./Types";

export const getInvestorFromWhitelist = async (transferManager: any, address: Address) => {
  const whitelist = await transferManager.getWhitelist();
  return whitelist.filter((investor: any) => investor.address === address)[0];
};

export const buildInvestor = (investor: PMT.Investor, whitelistedInvestor: any) => {
  let pmInvestor: any;

  if (investor.international) {
    if (whitelistedInvestor) {
      if (moment().diff(whitelistedInvestor.expiry, "days") < 0) {
        return null;
      }

      pmInvestor = {
        address: whitelistedInvestor.address,
        from: whitelistedInvestor.from,
        to: whitelistedInvestor.to,
        expiry: moment().add(3, "months").toDate(),
      };
    } else {
      pmInvestor = {
        address: investor.address,
        from: moment().add(1, "years").toDate(),
        to: new Date(),
        expiry: moment().add(3, "months").toDate(),
      };
    }
  } else {
    if (whitelistedInvestor) {
      pmInvestor = {
        address: investor.address,
        from: moment().subtract(1, "years").toDate(),
        to: moment().subtract(1, "years").toDate(),
        expiry: moment().subtract(1, "years").toDate(),
      };
    } else {
      return null;
    }
  }

  return pmInvestor;
};
