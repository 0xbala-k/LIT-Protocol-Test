import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

export let capacityTokenId = "";

const walletWithCapacityCredit = new ethers.Wallet(
    process.env.PRIVATE_KEY, 
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

export async function mintCapacityCredits(){
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

    capacityTokenId = capacityTokenIdStr;

    return capacityTokenIdStr;
}