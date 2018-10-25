// import * as PM from "polymathjs";
// import * as Web3 from "web3";

// import {
//   Exchange,
//   Tagged,
//   Testing,
//   ScopedCommitment,
//   Portfolio
// } from "../Types";
// import { putInvestor } from "./Interface";

// const web3 = new Web3(
//   new HDWalletProvider(
//     'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
//     'http://localhost:8545'
//   )
// );

// const cWeb3 = {
//   web3,
//   gasPrice: async () => {
//     return 5;
//   },
//   controller: 'master'
// };

// const networkParams = {
//   account: '0x627306090abab3a6e1400e9345bc60c78a8bef57', // transactions sender
//   id: '*', // Kovan network id
//   web3,
//   web3WS: web3, // Web3 1.0 instance supplied with WebsocketProvider, it can be the same instance as the one above
//   txHashCallback: (hash: Object) => console.log(hash), // receives a transaction hash every time one was generated
//   txEndCallback: (receipt: Object) => console.log(receipt), // receives a transaction receipt every time one was mined
// }

// PM.Contract.setParams(networkParams);

// // ~~~~~~~~~ //
// // CONSTANTS //
// // ~~~~~~~~~ //

// const TRUST_SERVICE = 1;
// const DS_TOKEN = 2;
// const REGISTRY_SERVICE = 4;
// const COMPLIANCE_SERVICE = 8;
// const COMMS_SERVICE = 16;
// const WALLET_MANAGER = 32;
// const LOCK_MANAGER = 64;

// const EXCHANGE = 4;

// const regions = {
//   none: 0,
//   us: 1,
//   eu: 2,
//   forbidden: 4
// };

// const forbidden = ["KP"];

// // ~~~~ //
// // INIT //
// // ~~~~ //

// // Launch a DS token
// export async function deployDS(
//   controller: string,
//   exchange: string,
//   complianceType: "notRegulated" | "whitelisted" | "regulated",
//   web3: Web3
// ) {
//   const receipts = receiptsRetriever(web3);
//   // Setup contract factories
//   const complianceContractName = (() => {
//     switch (complianceType) {
//       case "notRegulated":
//         return "ESComplianceServiceNotRegulated";
//       case "whitelisted":
//         return "ESComplianceServiceWhitelisted";
//       case "regulated":
//         return "ESComplianceServiceRegulated";
//     }
//   })();
//   const [
//     Storage,
//     TrustService,
//     ComplianceService,
//     RegistryService,
//     WalletManager,
//     LockManager,
//     Proxy,
//     DSToken
//   ] = [
//     "EternalStorage",
//     "ESTrustService",
//     complianceContractName,
//     "ESRegistryService",
//     "ESWalletManager",
//     "ESLockManager",
//     "Proxy",
//     "DSToken"
//   ].map(name => web3.eth.contract(Artifacts[name].abi));
//   // STORAGE
//   console.log("Deploying storage");
//   const [storageReceipt] = await receipts([
//     Storage.new({
//       data: Artifacts.EternalStorage.bytecode,
//       from: controller,
//       gas: 2e6
//     }).transactionHash
//   ]);
//   if (storageReceipt.contractAddress === null) {
//     throw Error("storage deployment failed");
//   }
//   const storage = Storage.at(storageReceipt.contractAddress);
//   // SERVICES
//   console.log("Deploying services");
//   console.log("trust, registry, & compliance");
//   const [
//     trustServiceReceipt,
//     registryServiceReceipt,
//     complianceServiceReceipt
//   ] = await receipts([
//     TrustService.new(storage.address, "DSTokenTestTrustManager", {
//       data: Artifacts.ESTrustService.bytecode,
//       from: controller,
//       gas: 1.2e6
//     }).transactionHash,
//     RegistryService.new(storage.address, "DSTokenTestRegistryManager", {
//       data: Artifacts.ESRegistryService.bytecode,
//       from: controller,
//       gas: 6.7e6
//     }).transactionHash,
//     ComplianceService.new(storage.address, "DSTokenTestComplianceManager", {
//       data: Artifacts[complianceContractName].bytecode,
//       from: controller,
//       gas: 6.6e6
//     }).transactionHash
//   ]);
//   // TOKEN PARAPHERNALIA
//   console.log("wallet, lock, token, & proxy");
//   const [
//     walletManagerReceipt,
//     lockManagerReceipt,
//     tokenReceipt,
//     proxyReceipt
//   ] = await receipts([
//     WalletManager.new(storage.address, "DSTokenTestWalletManager", {
//       data: Artifacts.ESWalletManager.bytecode,
//       from: controller,
//       gas: 6.5e6
//     }).transactionHash,
//     LockManager.new(storage.address, "DSTokenTestLockManager", {
//       data: Artifacts.ESLockManager.bytecode,
//       from: controller,
//       gas: 6.5e6
//     }).transactionHash,
//     DSToken.new({
//       data: Artifacts.DSToken.bytecode,
//       from: controller,
//       gas: 6.5e6
//     }).transactionHash,
//     Proxy.new({
//       data: Artifacts.Proxy.bytecode,
//       from: controller,
//       gas: 6.5e6
//     }).transactionHash
//   ]);
//   // INSTANTIATIONS
//   if (complianceServiceReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const complianceService = ComplianceService.at(
//     complianceServiceReceipt.contractAddress
//   );
//   if (registryServiceReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const registryService = RegistryService.at(
//     registryServiceReceipt.contractAddress
//   );
//   if (trustServiceReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const trustService = TrustService.at(trustServiceReceipt.contractAddress);
//   if (walletManagerReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const walletManager = WalletManager.at(walletManagerReceipt.contractAddress);
//   if (lockManagerReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const lockManager = LockManager.at(lockManagerReceipt.contractAddress);
//   if (proxyReceipt.contractAddress === null) {
//     // FIXME
//     throw Error("Proxy address");
//   }
//   const proxy = Proxy.at(proxyReceipt.contractAddress);
//   if (tokenReceipt.contractAddress === null) {
//     // FIXME
//     throw Error();
//   }
//   const implAddress = tokenReceipt.contractAddress;
//   // Configuration
//   const stdOptions = { from: controller, gas: 1e5 };
//   // PROXY & TOKEN INITIALIZATION
//   console.log("Configuring the proxy");
//   await receipts([proxy.setTarget(implAddress, stdOptions)]);
//   const token = DSToken.at(proxy.address);
//   console.log("Initializing the token");
//   await receipts([
//     token.initialize("DSTokenTest", "DSTT", 6, storage.address, "DSTokenTest", {
//       from: controller,
//       gas: 5e5
//     })
//   ]);
//   // STORAGE
//   console.log("Configuring storage");
//   const addToStorage = (addr: string) =>
//     storage.adminAddRole(addr, "write", stdOptions);
//   // Allow storage write access to the ecosystem contracts
//   await receipts([
//     addToStorage(trustService.address),
//     addToStorage(complianceService.address),
//     addToStorage(walletManager.address),
//     addToStorage(lockManager.address),
//     addToStorage(registryService.address),
//     addToStorage(token.address)
//   ]);
//   // TRUST
//   console.log("Configuring trust service");
//   await receipts([
//     // Initialize the trust service
//     trustService.initialize(stdOptions),
//     // Give the `exchange` address exchange-level privileges
//     trustService.setRole(exchange, EXCHANGE, stdOptions)
//   ]);
//   // COMPLIANCE
//   console.log("Configuring the compliance service");
//   await receipts([
//     // Inform the compliance service about the trust service
//     complianceService.setDSService(
//       TRUST_SERVICE,
//       trustService.address,
//       stdOptions
//     ),
//     // Inform the compliance service about the registry service
//     complianceService.setDSService(
//       REGISTRY_SERVICE,
//       registryService.address,
//       stdOptions
//     ),
//     // Inform the compliance service about the token
//     complianceService.setDSService(DS_TOKEN, token.address, stdOptions),
//     complianceService.setDSService(
//       WALLET_MANAGER,
//       walletManager.address,
//       stdOptions
//     ),
//     complianceService.setDSService(
//       LOCK_MANAGER,
//       lockManager.address,
//       stdOptions
//     )
//   ]);
//   if (complianceType === "regulated") {
//     await receipts(
//       [complianceService.setCountryCompliance("US", regions.us, stdOptions)]
//         .concat(
//           isoCodesEU.map(code =>
//             complianceService.setCountryCompliance(code, regions.eu, stdOptions)
//           )
//         )
//         .concat(
//           forbidden.map(code =>
//             complianceService.setCountryCompliance(
//               code,
//               regions.forbidden,
//               stdOptions
//             )
//           )
//         )
//     );
//   }
//   // REGISTRY
//   console.log("Configuring the registry");
//   await receipts([
//     // Inform the registry service about the trust service
//     registryService.setDSService(
//       TRUST_SERVICE,
//       trustService.address,
//       stdOptions
//     ),
//     registryService.setDSService(
//       DS_TOKEN,
//       token.address,
//       stdOptions
//     ),
//     registryService.setDSService(
//       WALLET_MANAGER,
//       walletManager.address,
//       stdOptions
//     )
//   ]);
//   // TOKEN
//   console.log("Configuring the token");
//   await receipts([
//     // Inform the token about the trust service
//     token.setDSService(TRUST_SERVICE, trustService.address, stdOptions),
//     // Inform the token about the compliance service
//     token.setDSService(
//       COMPLIANCE_SERVICE,
//       complianceService.address,
//       stdOptions
//     ),
//     // Inform the token about the registry service
//     token.setDSService(REGISTRY_SERVICE, registryService.address, stdOptions),
//     token.setDSService(WALLET_MANAGER, walletManager.address, stdOptions),
//     token.setDSService(LOCK_MANAGER, lockManager.address, stdOptions)
//   ]);
//   // WALLET MANAGER
//   console.log("Configuring the wallet manager");
//   await receipts([
//     walletManager.setDSService(TRUST_SERVICE, trustService.address, stdOptions),
//     walletManager.setDSService(REGISTRY_SERVICE, registryService.address, stdOptions)
//   ]);
//   // LOCK MANAGER
//   console.log("Configuring the lock manager");
//   await receipts([
//     lockManager.setDSService(TRUST_SERVICE, trustService.address, stdOptions),
//     lockManager.setDSService(DS_TOKEN, token.address, stdOptions)
//   ]);
//   return {
//     storage,
//     complianceService,
//     registryService,
//     trustService,
//     walletManager,
//     lockManager,
//     proxy,
//     token
//   };
// }

// export const securitizeUniverse = async (
//   master: string,
//   exchange: string,
//   investors: Array<Exchange.Investor>,
//   regime: "regulated" | "notRegulated",
//   web3: Web3
// ) => {
//   const ds = await deployDS(master, exchange, regime, web3);
//   const tokenAddress = ds.token.address;
//   const expiration = moment()
//     .add(30, "days")
//     .toDate();
//   const mockDocs: Exchange.Documentation = {
//     documents: [["passport", Buffer.from("abcdef")]],
//     expiration
//   };
//   const portfolio: Map<string, number> = new Map([["DSTKN", 2000]]);
//   const testingInvestors: Array<Testing.Investor> = await Promise.all(
//     investors.map(async investor => {
//       const stInvestor = interpretInvestor(
//         investor,
//         { tag: "documents", ...mockDocs },
//         { tag: "documents", ...mockDocs }
//       );
//       console.log(`Configuring ${investor.fullName}`);
      // await putInvestor(stInvestor, investor.primaryWallet, tokenAddress, {
      //   web3,
      //   gasPrice: async () => {
      //     return 5;
      //   },
      //   controller: master
      // });
//       console.log("Issuing tokens");
//       ds.token.issueTokens(investor.primaryWallet, 1e8, {
//         from: master,
//         gas: 2e6
//       });
//       return {
//         ...investor,
//         portfolio,
//         kyc: mockDocs,
//         accreditation: mockDocs
//       };
//     })
//   );
//   const u: Testing.Universe = {
//     tokens: new Map([
//       ["DSTKN", { description: "DS Token", precision: 6, symbol: "DSTT", address: tokenAddress }]
//     ]),
//     investors: testingInvestors
//   };
//   return u;
// };
