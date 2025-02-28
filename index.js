import express from 'express';
import dotenv from 'dotenv';
import { mintCapacityCredits } from './mint_credits.js';
import { requestCapacity } from './delegateCompute.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

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

app.get('/delegate-capacity', async (req, res) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
