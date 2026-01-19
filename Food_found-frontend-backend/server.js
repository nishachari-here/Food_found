
BigInt.prototype.toJSON = function() { return this.toString() };
const express = require('express');
const jwt = require('jsonwebtoken'); // Added missing requirement
const { createPublicClient, createWalletClient, http } = require('viem');
const { hardhat } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// FIX: Use forward slashes for Windows paths in Node.js or double backslashes
const contractArtifact = require('C:/Users/nithy/repo/Food_found/Hard_hat/artifacts/contracts/OrganicTraceability.sol/OrganicTraceability.json');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());



const SECRET_KEY = "eco_tech_secret_2026";
const CONTRACT_ADDRESS = '0x5fc8d32690cc91d4c39d9d3abcbd16989f875707';
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain: hardhat, transport: http() });
const walletClient = createWalletClient({ account, chain: hardhat, transport: http() });

const STATUS_MAP = ["Harvested", "Certified", "Processed", "InTransit", "Delivered"];

const formatJourney = (rawJourney) => {
  return rawJourney.map((stage) => ({
    status: STATUS_MAP[Number(stage.status)], 
    location: stage.location,
    timestamp: new Date(Number(stage.timestamp) * 1000).toISOString(),
    processedBy: stage.processedBy
  }));
};

// --- Middleware ---




// Middleware to verify Firebase JWT and check Roles
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log("Auth Blocked: No token in header");
    return res.status(401).send("No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Auth Success: Token verified for", decodedToken.email);
    req.user = decodedToken;
    next();
  } catch (error) {
    // THIS LOG IS CRUCIAL
    console.error("Firebase Token Verification Failed:", error.message);
    res.status(403).send("Invalid Firebase Token");
  }
};
verifyProducerRole = async (req, res, next) => {
  console.log("Admin SDK Project ID:", admin.app().options.credential.projectId);
  
  const userRef = admin.firestore().collection('users').doc(req.user.uid);
  console.log("Checking path:", userRef.path);
  
  try {
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      console.log(`[Auth Error] No Firestore document for UID: ${req.user.uid}`);
      return res.status(403).json({ error: "User profile not found in database." });
    }

    const userData = userDoc.data();
    
    if (userData.role !== 'producer') {
      console.log(`[Auth Error] User ${req.user.email} is a ${userData.role}, not a producer.`);
      return res.status(403).json({ error: "Access denied: Producers only." });
    }

    // Success! Move to the next function
    next(); 
  } catch (error) {
    console.error("Role Verification Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// --- Routes ---

// 1. Get Product Traceability (Public)
app.get('/api/v1/trace/:batchId', async (req, res) => {
  try {
    const id = BigInt(req.params.batchId);

    // 1. Fetch Product Details using your specific getter
    // Based on your Solidity: returns (name, currentOwner, isOrganic, metrics, metadataURI)
    const productData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'getProductDetails', 
      args: [id]
    });

    // 2. Fetch the Journey
    const journey = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'getProductJourney',
      args: [id]
    });

    // Destructure based on your getProductDetails return signature
    const [name, currentOwner, isOrganic, metrics, metadataURI] = productData;

    res.json({
      batchId: req.params.batchId,
      name: name,
      owner: currentOwner,
      isOrganic: isOrganic,
      water: metrics.waterUsage.toString(), // accessing struct fields from return
      carbon: metrics.carbonFootprint.toString(),
      soil: metrics.soilHealth.toString(),
      journey: formatJourney(journey)
    });

  } catch (error) {
    console.error("Trace Error:", error.message);
    res.status(404).json({ error: "Batch not found on-chain. Ensure the ID is correct." });
  }
});

// 2. Commit New Stage (Producer Only)
app.post('/api/v1/commit-stage', authenticateToken, async (req, res) => {
  const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
  const userData = userDoc.data();

  if (userData.role !== 'producer') {
    return res.status(403).json({ error: "Only producers can register batches" });
  }
  
  const { batchId, status, location } = req.body; 

  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: 'updateStatus',
      args: [BigInt(batchId), status, location]
    });

    res.status(201).json({ 
      message: "Committed to Blockchain Ledger", 
      transactionHash: hash 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/v1/register', authenticateToken, verifyProducerRole, async (req, res) => {
    try {
        const { name, metadataURI, location, water, carbon, soil } = req.body;

        const hash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: contractArtifact.abi,
            functionName: 'registerProduct',
            args: [name, metadataURI || "", location, BigInt(water), BigInt(carbon), BigInt(soil)]
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        // VITAL FIX: Parse the log specifically for ProductCreated
        // topics[0] is the Event Signature Hash
        // topics[1] is the indexed 'id' (uint256)
        const log = receipt.logs.find(l => l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase());
        
        let batchId = "0";
        if (log && log.topics.length > 1) {
            batchId = BigInt(log.topics[1]).toString();
        } else {
            // Fallback: Query the public productCount if logs are messy
            const count = await publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi: contractArtifact.abi,
                functionName: 'productCount'
            });
            batchId = count.toString();
        }

        console.log(`Successfully Registered. Batch ID: ${batchId}`);

        res.status(201).json({
            message: "Product Registered on Blockchain",
            batchId: batchId,
            transactionHash: hash
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));