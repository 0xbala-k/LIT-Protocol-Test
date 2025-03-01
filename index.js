import express from 'express';
import dotenv from 'dotenv';
import { mintCapacityCredits } from './mint_credits.js';
import { requestCapacity } from './delegateCompute.js';
import cors from 'cors';
import axios from 'axios';
import pkg from './ethstorage_helper.cjs';
import { ethers, utils } from "ethers";

const { createFlatDirectory, uploadData } = pkg;

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

let contractAddress = "";

// Enable CORS for all origins
app.use(cors({
    origin: "*", // Allow any origin
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Define API routes
app.get('/mint-capacity-credits', async (req, res) => {
    try {
        const { requestsPerKilosecond = 80, days = 2 } = req.query;
        const capacityTokenIdStr = await mintCapacityCredits(Number(requestsPerKilosecond), Number(days));
        res.status(200).json({ capacityTokenIdStr });
    } catch (error) {
        console.error('Error minting capacity credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/delegate-capacity', async (req, res) => {
    const { userAddress, capacityTokenIdStr, uses = '1' } = req.body;
    try {
        if (!userAddress || !capacityTokenIdStr) throw new Error("Missing userAddress or capacityTokenIdStr");
        const delegationAuthSig = await requestCapacity(userAddress, capacityTokenIdStr, uses);
        res.status(200).json({ delegationAuthSig });
    } catch (error) {
        console.error('Error delegating capacity credits:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post("/upload-data", async (req, res) => {
    const { key, content } = req.body;
    try {
        if (!key || !content) throw new Error("Missing key or content");
        console.log(key + "  " + content);
        await uploadData(key, content, contractAddress);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error uploading data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error: ' + error.message });
    }
});

app.get("/get-data/:key", async (req, res) => {
    const key = req.params.key;
    if (!contractAddress) {
        return res.status(503).json({ success: false, error: "EthStorage contract not yet initialized" });
    }
    const url = `https://${contractAddress}.3337.w3link.io/${key}`;
    console.log("Fetching from URL:", url);
    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ success: false, error: `Failed to fetch data: ${error.message}`, url });
    }
});

// Start the server after initializing contract
async function startServer() {
    try {
        contractAddress = await createFlatDirectory();
        console.log("EthStorage contract address initialized:", contractAddress);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to initialize EthStorage contract and start server:", error);
        process.exit(1);
    }
}

startServer();
