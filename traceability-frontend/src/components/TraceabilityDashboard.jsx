import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, Truck, Package, Factory, MapPin } from 'lucide-react';

const API_BASE = "http://localhost:3000/api/v1";

const TraceabilityDashboard = () => {
  const [batchId, setBatchId] = useState('');
  const [journey, setJourney] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(''); // Use the token from your terminal here

  // 1. Fetch Journey from Blockchain
  const traceProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/trace/${batchId}`);
      setJourney(res.data.journey);
    } catch (err) {
      alert("Batch not found on-chain");
      setJourney([]);
    }
    setLoading(false);
  };

  // 2. Register New Product
  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      const res = await axios.post(`${API_BASE}/register`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Success! Transaction Hash: ${res.data.transactionHash}`);
    } catch (err) {
      alert("Registration failed. Check console.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Harvested': return <CheckCircle className="text-green-500" />;
      case 'Processed': return <Factory className="text-blue-500" />;
      case 'InTransit': return <Truck className="text-orange-500" />;
      default: return <Package className="text-gray-500" />;
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Eco-Tech Blockchain Ledger</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Producer Controls */}
        <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px #ddd' }}>
          <h3>🚜 Producer Portal</h3>
          <input 
            type="text" 
            placeholder="Paste JWT Token" 
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <form onSubmit={handleRegister}>
            <input name="name" placeholder="Product Name" required style={inputStyle} />
            <input name="location" placeholder="Origin Location" required style={inputStyle} />
            <div style={{ display: 'flex', gap: '5px' }}>
              <input name="water" type="number" placeholder="Water" style={inputStyle} />
              <input name="soil" type="number" placeholder="Soil %" style={inputStyle} />
              <input name="carbon" type="number" placeholder="Carbon" style={inputStyle} />
            </div>
            <button type="submit" style={btnStyle}>Register Batch</button>
          </form>
        </section>

        {/* Consumer Trace */}
        <section style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px #ddd' }}>
          <h3>🔍 Consumer Trace</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="number" 
              placeholder="Batch ID" 
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              style={inputStyle} 
            />
            <button onClick={traceProduct} style={{ ...btnStyle, width: '80px' }}>Go</button>
          </div>

          <div style={{ marginTop: '20px' }}>
            {journey.map((step, index) => (
              <div key={index} style={timelineItemStyle}>
                {getStatusIcon(step.status)}
                <div style={{ marginLeft: '15px' }}>
                  <div style={{ fontWeight: 'bold' }}>{step.status}</div>
                  <div style={{ fontSize: '0.85em', color: '#666' }}>
                    <MapPin size={12} /> {step.location}
                  </div>
                  <div style={{ fontSize: '0.75em', color: '#999' }}>{new Date(step.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const btnStyle = { width: '100%', padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const timelineItemStyle = { display: 'flex', alignItems: 'center', padding: '10px 0', borderLeft: '2px solid #eee', paddingLeft: '20px', position: 'relative', marginBottom: '10px' };

export default TraceabilityDashboard;