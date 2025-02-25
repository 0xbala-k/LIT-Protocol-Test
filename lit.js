import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC, LIT_ABILITY } from "@lit-protocol/constants";
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { ethers } from "ethers";
import {
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";

const account1= "cae12297a07b1d5a55515ec06cb378878cb99bdd0e43c505ffe8b9748103134d"
const bob = new ethers.Wallet(
    account1, 
    new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const account2="e889d17573e4454c56ea7e82d62f6bb1e3409d4fdc55c50c32d3a809fd2543d6"
const alice = new ethers.Wallet(
    account2
    // new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
)

const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "sepolia",
    method: "eth_getBalance",
    parameters: [":userAddress", "latest"],
    returnValueTest: {
      comparator: ">=",
      value: "1000000000000", // 0.000001 ETH
    },
  },
];

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

  async delegateCapacity(capacityTokenIdStr , userAddress){
    const { capacityDelegationAuthSig } =
    await this.litNodeClient.createCapacityDelegationAuthSig({
        uses: '1',
        dAppOwnerWallet: bob,
        capacityTokenId: capacityTokenIdStr,
        delegateeAddresses: [userAddress],
    });

    return capacityDelegationAuthSig;
  }

  async encrypt(message) {

    // Encrypt the message
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: message,
      },
      this.litNodeClient,
    );

    // Return the ciphertext and dataToEncryptHash
    return {
      ciphertext,
      dataToEncryptHash,
    };
  }

  async getSessionSignatures(capacityDelegationAuthSig, wallet){
      // Get the latest blockhash
      const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

      // Define the authNeededCallback function
      const authNeededCallback = async(params) => {
        if (!params.uri) {
          throw new Error("uri is required");
        }
        if (!params.expiration) {
          throw new Error("expiration is required");
        }

        if (!params.resourceAbilityRequests) {
          throw new Error("resourceAbilityRequests is required");
        }

        // Create the SIWE message
        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: wallet.address,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient,
        });

        // Generate the authSig
        const authSig = await generateAuthSig({
          signer: wallet,
          toSign,
        });

        return authSig;
      }

      // Define the Lit resource
      const litResource = new LitAccessControlConditionResource('*');

      // Get the session signatures
      const sessionSigs = await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LIT_ABILITY.AccessControlConditionDecryption,
              },
          ],
          authNeededCallback,
          capacityDelegationAuthSig,
      });
      return sessionSigs;
  }

  async decrypt(ciphertext, dataToEncryptHash, capacityDelegationAuthSig, wallet) {
    // Get the session signatures
    const sessionSigs = await this.getSessionSignatures(capacityDelegationAuthSig, wallet);

    // Decrypt the message
    const decryptedString = await decryptToString(
      {
        accessControlConditions,
        chain: this.chain,
        ciphertext,
        dataToEncryptHash,
        sessionSigs,
      },
      this.litNodeClient,
    );

    // Return the decrypted string
    return { decryptedString };
  }
}

const chain = "ethereum";

// connect to Lit network
let myLit = new Lit(chain);
await myLit.connect();

// encrypt data
let encryptionData  = await myLit.encrypt("Test message");

// connect to EthStorage

// upload encrypted data to EthStorage
console.log("Encryption Data", encryptionData)

// fetch encrypted data from EthStorage

// delegate capacity to alice
const delegationAuthSig = await myLit.delegateCapacity("835", "0x3bcfE4886A51F4Bc11bf2317176221633E15307B");
console.log("Delegation Auth Sig: ", delegationAuthSig)


// decrypt message
const decryptedString = await myLit.decrypt(encryptionData.ciphertext,encryptionData.dataToEncryptHash,delegationAuthSig, alice);

console.log("Decrypted String: ", decryptedString)

// disconnect from Lit network
await myLit.disconnect();