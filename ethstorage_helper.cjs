// const { EthStorage } = require("ethstorage-sdk");
const { FlatDirectory } = require("ethstorage-sdk");
const dotenv = require('dotenv');

dotenv.config();

const rpc = "https://rpc.beta.testnet.l2.quarkchain.io:8545";
const ethStorageRpc = "https://rpc.beta.testnet.l2.ethstorage.io:9596";
// const ethStorageRpc = "http://65.108.236.27:9540";
const privateKey = process.env.PRIVATE_KEY;



async function createFlatDirectory() {
    const flatDirectory = await FlatDirectory.create({
        rpc: rpc,
        privateKey: privateKey,
    });
    const contractAddress = await flatDirectory.deploy();

    return contractAddress;
}

async function uploadData(key, data, contractAddress) {
    const flatDirectory = await FlatDirectory.create({
        rpc: rpc,
        privateKey: privateKey,
        address: contractAddress,
    });

    const callback = {
        onProgress: function (progress, count, isChange) {
            console.log(`Upload Progress: ${progress}% complete. Count: ${count}`);
        },
        onFail: function (err) {
            console.error('Upload failed:', err);
        },
        onFinish: function (totalUploadChunks, totalUploadSize, totalStorageCost) {
            console.log(`Upload complete! Chunks: ${totalUploadChunks}, Size: ${totalUploadSize} bytes, Cost: ${totalStorageCost}`);
        }
    };

    const request = {
        key: key,
        content: Buffer.from(data),
        type: 2, // 1 for calldata and 2 for blob
        callback: callback
    }
    await flatDirectory.upload(request);
}

async function downloadData(key, contractAddress) {
    const flatDirectory = await FlatDirectory.create({
        rpc: rpc,
        ethStorageRpc: ethStorageRpc,
        privateKey: privateKey,
        address: contractAddress,
    });

    const callback = {
        onProgress: function (progress, count, chunk) {
            console.log(`Download Progress: ${progress}% complete. Count: ${count}`);
        },
        onFail: function (err) {
            console.error('Download failed:', err);
        },
        onFinish: function (data) {
            console.log(`Download complete! Data: ${data}`);
        }
    };

    const result = await flatDirectory.download(key, callback);
    console.log("Result: ", result)
    return result;
}

module.exports = { 
    createFlatDirectory,
    uploadData,
    downloadData
 };

// // Wrap the code in an async function
// (async () => {
//     try {
//         const contractAddress = await createFlatDirectory();
//         await uploadData("test", "test data here", contractAddress);
//         // const resp = await downloadData("test", contractAddress);
//         // console.log(resp);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// })();
