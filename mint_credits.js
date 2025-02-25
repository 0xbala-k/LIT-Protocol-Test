import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";

const account1= "cae12297a07b1d5a55515ec06cb378878cb99bdd0e43c505ffe8b9748103134d"
const walletWithCapacityCredit = new ethers.Wallet(
    account1, 
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

let contractClient = new LitContracts({
  signer: walletWithCapacityCredit,
  network: LIT_NETWORK.DatilDev,
});

await contractClient.connect();

// this identifier will be used in delegation requests. 
const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerKilosecond: 80,
    // requestsPerDay: 14400,
    // requestsPerSecond: 10,
    daysUntilUTCMidnightExpiration: 2,
  });

console.log("ID: ",capacityTokenIdStr)


// const chain = "ethereum";
// const myLit = new Lit(chain);

// // Connect to the Lit network
// await myLit.connect();

// const delegationAuthSig = await myLit.delegateCapacity(capacityTokenIdStr, walletWithCapacityCredit);
// console.log("Delegation Auth Sig: ", delegationAuthSig)

// await myLit.disconnect();