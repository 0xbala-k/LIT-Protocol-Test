import express from 'express';
import dotenv from 'dotenv';
import { mintCapacityCredits } from './mint_credits.js';
import { requestCapacity } from './delegateCompute.js';
import cors from 'cors';
import axios from 'axios';
import pkg from './ethstorage_helper.cjs';
const { createFlatDirectory, uploadData } = pkg;

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

let contractAddress = "";

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// init ethStorage
 contractAddress = await createFlatDirectory();

// Define a simple API route
app.get('/mint-capacity-credits', async (req, res) => {
    try{
        const capacityTokenIdStr =  await mintCapacityCredits();
        res.json({ capacityTokenIdStr: capacityTokenIdStr });
    }catch(error){
        console.error('Error minting capacity credits:', error);
        res.status(500).json({ error: 'Internal Server Error, '+error });
    }
});

app.post('/delegate-capacity', async (req, res) => {
    const data = req.body;
    const userAddress = data["userAddress"];
    try{
        const delegationAuthSig = await requestCapacity(userAddress);
        res.json({ delegationAuthSig: delegationAuthSig });
    }catch(error){
        console.error('Error delegating capacity credits:', error);
        res.status(500).json({ error: 'Internal Server Error, '+error });
    }
});

app.post("/upload-data", async (req, res) => {
    const data = req.body;
    const key = data["key"];
    const content = data["content"];
    try{
        await uploadData(key, content, contractAddress);
        res.json({ success: true });
    }catch(error){
        console.error('Error uploading data:', error);
        res.status(500).json({ error: 'Internal Server Error, '+error });
    }
});

app.get("/get-data/:key", async (req, res) => {
    console.log("contractAddress: ", contractAddress);
    const key = req.params.key;
    const url =  `https://${contractAddress}.3337.w3link.io/${key}`;
    console.log("URL: ", url);
    try{
        const response = await axios.get(url);
        res.json({ data: response.data });
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error, '+error+" URL: "+url });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
