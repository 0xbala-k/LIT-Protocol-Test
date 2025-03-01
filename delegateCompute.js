import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { ethers } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env");
}

const dappOwner = new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

async function connectWithRetry(litNodeClient, maxRetries = 1) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await litNodeClient.connect();
            return;
        } catch (error) {
            if (i === maxRetries - 1) throw new Error(`Failed to connect after ${maxRetries} attempts: ${error.message}`);
            console.warn(`Connect attempt ${i + 1} failed, retrying...`, error);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export class Lit {
    litNodeClient;
    chain;

    constructor(chain) {
        this.chain = chain;
        this.litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: LIT_NETWORK.DatilDev,
        });
    }

    async connect() {
        await connectWithRetry(this.litNodeClient);
    }

    async disconnect() {
        await this.litNodeClient.disconnect();
    }

    async delegateCapacity(capacityTokenIdStr, userAddress, uses = '1') {
        try {
            const capacityDelegationAuthSig = await this.litNodeClient.createCapacityDelegationAuthSig({
                uses,
                dAppOwnerWallet: dappOwner,
                capacityTokenId: capacityTokenIdStr,
                delegateeAddresses: [userAddress],
            });
            return capacityDelegationAuthSig;
        } catch (error) {
            throw new Error(`Failed to create capacity delegation auth sig: ${error.message}`);
        }
    }
}

export async function requestCapacity(userAddress, capacityTokenIdStr, uses = '1') {
    try {
        const chain = "ethereum";
        let myLit = new Lit(chain);
        await myLit.connect();
        const delegationAuthSig = await myLit.delegateCapacity(capacityTokenIdStr, userAddress, uses);
        await myLit.disconnect();
        return delegationAuthSig;
    } catch (error) {
        throw new Error(`Failed to delegate capacity: ${error.message}`);
    }
}
