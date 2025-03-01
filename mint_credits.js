import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in .env");
}

const walletWithCapacityCredit = new ethers.Wallet(
    PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

async function connectWithRetry(contractClient, maxRetries = 1) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await contractClient.connect();
            return;
        } catch (error) {
            if (i === maxRetries - 1) throw new Error(`Failed to connect after ${maxRetries} attempts: ${error.message}`);
            console.warn(`Connect attempt ${i + 1} failed, retrying...`, error);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

export async function mintCapacityCredits(requestsPerKilosecond = 80, daysUntilUTCMidnightExpiration = 2) {
    try {
        let contractClient = new LitContracts({
            signer: walletWithCapacityCredit,
            network: LIT_NETWORK.DatilDev,
        });
        
        await connectWithRetry(contractClient);

        const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
            requestsPerKilosecond,
            daysUntilUTCMidnightExpiration,
        });

        return capacityTokenIdStr;
    } catch (error) {
        throw new Error(`Failed to mint capacity credits: ${error.message}`);
    }
}
