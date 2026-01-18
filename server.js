const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const app = express();
app.use(express.json());

const SECRET_KEY = "eco_tech_secret_2026";

// Mock Database
let batches = [
  {
    id: "FF-9920",
    name: "Organic Heirloom Tomatoes",
    producerId: "farm_001",
    journey: [
      { stage: "Harvested", location: "Ojai, CA", hash: "0x8a2f...3e1", timestamp: "2026-01-15T08:00:00Z" }
    ],
    metrics: { water: 1200, carbon: 1.2, soilHealth: 94 }
  }
];

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes ---

// 1. Get Product Traceability (Public)
app.get('/api/v1/trace/:batchId', (req, res) => {
  const batch = batches.find(b => b.id === req.params.batchId);
  batch ? res.json(batch) : res.status(404).send('Batch not found');
});

// 2. Commit New Stage (Producer Only)
app.post('/api/v1/commit-stage', authenticateToken, (req, res) => {
  if (req.user.role !== 'producer') return res.status(403).send('Unauthorized');
  
  const { batchId, stage, location } = req.body;
  const batch = batches.find(b => b.id === batchId);
  
  // Simulate Blockchain Hashing
  const prevHash = batch.journey[batch.journey.length - 1].hash;
  const newHash = crypto.createHash('sha256')
    .update(prevHash + stage + Date.now())
    .digest('hex');

  const newEntry = {
    stage,
    location,
    timestamp: new Date().toISOString(),
    hash: `0x${newHash.substring(0, 8)}...${newHash.substring(58)}`
  };

  batch.journey.push(newEntry);
  res.status(201).json({ message: "Committed to ledger", entry: newEntry });
});

app.listen(3000, () => console.log('Server running on port 3000'));