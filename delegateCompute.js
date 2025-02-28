import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { ethers } from "ethers";
import dotenv from 'dotenv';
import { capacityTokenId } from "./mint_credits.js";
dotenv.config();

const dappOwner = new ethers.Wallet(
    process.env.PRIVATE_KEY, 
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

export class Lit {
   litNodeClient;
   chain;

   constructor(chain){
     this.chain = chain;
   }

   async connect() {
      this.litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK.DatilDev,
      });
      await this.litNodeClient.connect();
   }

   async disconnect(){
     await this.litNodeClient.disconnect();
   }

  async delegateCapacity(capacityTokenIdStr, userAddress){
    const { capacityDelegationAuthSig } =
    await this.litNodeClient.createCapacityDelegationAuthSig({
        uses: '1',
        dAppOwnerWallet: dappOwner,
        capacityTokenId: capacityTokenIdStr,
        delegateeAddresses: [userAddress],
    });

    return capacityDelegationAuthSig;
  }
}

export async function requestCapacity(userAddress){
    const chain = "ethereum";
    // connect to Lit network
    let myLit = new Lit(chain);
    await myLit.connect();
    // delegate capacity to alice
    const delegationAuthSig = await myLit.delegateCapacity(capacityTokenId, userAddress);
    await myLit.disconnect();

    return delegationAuthSig;
}