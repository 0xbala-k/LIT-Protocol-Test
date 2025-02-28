// const { EthStorage } = require("ethstorage-sdk");
const { FlatDirectory } = require("ethstorage-sdk");

(async () => {
  const rpc = "https://rpc.beta.testnet.l2.quarkchain.io:8545/";
  const ethStorageRpc = "https://rpc.beta.testnet.l2.ethstorage.io:9596/";
  // const privateKey = "0x...";
  const privateKey = "cae12297a07b1d5a55515ec06cb378878cb99bdd0e43c505ffe8b9748103134d";

  // const ethStorage = await EthStorage.create({
  //   rpc: rpc,
  //   ethStorageRpc: ethStorageRpc,
  //   privateKey: privateKey,
  // });

//   const key = "test.txt";
//   const data = Buffer.from("test data");
//  const write =  await ethStorage.write(key, data);
//  console.log("Write resp: ", write)

//   const dataRead = await ethStorage.read(key);
//   console.log("Read:", new TextDecoder().decode(dataRead));

    // Flat Directory
    const flatDirectory = await FlatDirectory.create({
        rpc: rpc,
        privateKey: privateKey,
    });
    const contractAddress = await flatDirectory.deploy();
    console.log(`FlatDirectory address: ${contractAddress}.`);

    // const contractAddress="0xf54Ea87E980e930932225D75fAfCA8CE5d28F220"
    // const flatDirectory = await FlatDirectory.create({
    //     rpc: rpc,
    //     privateKey: privateKey,
    //     address: contractAddress,
    // });

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
        key: "Naa.modda",
        content: Buffer.from("big data"),
        type: 2, // 1 for calldata and 2 for blob
        callback: callback
    }
    await flatDirectory.upload(request);
})();