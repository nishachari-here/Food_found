import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Truck, Package, Factory, MapPin, QrCode, LogOut, Droplets, Wind, Sprout, ShieldCheck } from 'lucide-react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc } from "firebase/firestore";
import { Html5QrcodeScanner } from "html5-qrcode";

const API_BASE = "http://localhost:3000/api/v1";

const TraceabilityDashboard = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('consumer');
  const [batchId, setBatchId] = useState('');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const idToken = await user.getIdToken();
        setToken(idToken);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) setRole(userDoc.data().role);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 20, qrbox: 250, aspectRatio: 1 });
    scanner.render((decodedText) => {
      setBatchId(decodedText);
      traceProduct(decodedText);
      scanner.clear();
    }, (error) => {});
  };

  const traceProduct = async (id = batchId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/trace/${id}`);
      setTraceData(res.data);
    } catch (err) {
      alert("Batch not found on-chain");
      setTraceData(null);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  console.log("Step 1: Registration Form Submitted");

  try {
    const freshToken = await auth.currentUser.getIdToken(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    console.log("Step 2: Sending data to server...");
    const res = await axios.post(`${API_BASE}/register`, data, {
      headers: { Authorization: `Bearer ${freshToken}` }
    });

    console.log("Step 3: Server Response Received:", res.data);

    // Look for the ID in multiple possible locations
    const newId = res.data.batchId || res.data.id; 
    
    if (newId !== undefined && newId !== null) {
      console.log("Step 4: Valid ID found:", newId);
      
      const idStr = newId.toString();
      const generatedUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${idStr}`;
      
      // Update state
      setBatchId(idStr);
      setQrCode(generatedUrl);
      
      console.log("Step 5: QR URL Generated:", generatedUrl);
      alert(`Registration Successful! Batch ID: ${idStr}`);
    } else {
      console.warn("Step 4 FAIL: No ID found in response. Check server.js res.json structure.");
    }
  } catch (err) {
    console.error("CRITICAL ERROR in handleRegister:", err);
    alert("Error: " + (err.response?.data?.error || err.message));
  }
};

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #e2e8f0' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem' }}>Eco-Tech Blockchain</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Precision Supply Chain & Sustainability Tracking</p>
        </div>
        {user && (
          <button onClick={() => signOut(auth)} style={logoutBtnStyle}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Logout ({role})
          </button>
        )}
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        
        {/* PRODUCER SECTION */}
        {role === 'producer' && (
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Factory color="#059669" />
              <h3 style={{ margin: 0 }}>Producer Portal</h3>
            </div>
            <form onSubmit={handleRegister}>
              <div style={inputGroup}>
                <label style={labelStyle}>Product Identity</label>
                <input name="name" placeholder="e.g. Organic Arabica Coffee" required style={inputStyle} />
                <input name="location" placeholder="Origin (e.g. Coorg, India)" required style={inputStyle} />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Sustainability Metrics </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div style={inlineInput}>
                    <Droplets size={14} color="#3b82f6" />
                    <input name="water" type="number" placeholder="Water" style={nakedInput} />
                  </div>
                  <div style={inlineInput}>
                    <Sprout size={14} color="#10b981" />
                    <input name="soil" type="number" placeholder="Soil %" style={nakedInput} />
                  </div>
                  <div style={inlineInput}>
                    <Wind size={14} color="#64748b" />
                    <input name="carbon" type="number" placeholder="CO2" style={nakedInput} />
                  </div>
                </div>
              </div>
              <button type="submit" style={btnStyle}>Register Batch on Ledger</button>
            </form>

            {qrCode && (
  <div style={{ 
    marginTop: '25px', 
    padding: '20px', 
    background: '#ffffff', 
    borderRadius: '12px', 
    border: '2px dashed #059669', 
    textAlign: 'center' 
  }}>
    <h4 style={{ color: '#1e293b', marginBottom: '10px' }}>Blockchain QR Label</h4>
    <img 
      key={batchId} // Forces the browser to reload the image when batchId changes
      src={qrCode} 
      alt="Batch QR" 
      style={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
    />
    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
      ID: {batchId}
    </p>
  </div>
)}
          </section>
        )}

        {/* CONSUMER / TRACE SECTION */}
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <QrCode color="#2563eb" />
            <h3 style={{ margin: 0, color: "black" }}>Consumer Verification</h3>
          </div>
          
          <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}></div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input 
              type="number" 
              placeholder="Enter Batch ID manually" 
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              style={inputStyle} 
            />
            <button onClick={() => traceProduct()} style={secondaryBtnStyle}>Trace</button>
            <button onClick={startScanner} style={iconBtnStyle} title="Open Camera"><QrCode size={20} /></button>
          </div>

          {traceData ? (
            <div style={resultsContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'black' }}>{traceData.name}</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>ID: {traceData.batchId} | Owner: {traceData.owner?.slice(0,10)}...</p>
                </div>
                {traceData.isOrganic && (
                  <div style={organicBadge}><ShieldCheck size={16} /> Organic</div>
                )}
              </div>

              {/* METRICS VIEW */}
              <div style={metricsGrid}>
                <div style={{ ...metricCard, color: 'black' }}><Droplets size={16} color="#3b82f6" /> <span>{traceData.water} L</span></div>
                <div style={{ ...metricCard, color: 'black' }}><Wind size={16} color="#ef4444" /> <span>{traceData.carbon} kg</span></div>
                <div style={{ ...metricCard, color: 'black' }}><Sprout size={16} color="#10b981" /> <span>{traceData.soil}% Soil</span></div>
              </div>

              {/* TIMELINE */}
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '15px' }}>Journey Log</h4>
                {traceData.journey.map((step, index) => (
                  <div key={index} style={timelineItem}>
                    <div style={timelineBullet}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{step.status}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(step.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {step.location}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Package size={48} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>Scan a QR code or enter an ID to view on-chain history</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// CSS-in-JS Styles
const cardStyle = { background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', transition: 'border 0.2s' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' };
const inputGroup = { marginBottom: '20px' };
const inlineInput = { display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '0 10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const nakedInput = { border: 'none', background: 'transparent', padding: '10px 5px', width: '100%', fontSize: '13px', outline: 'none', color: 'black' };
const btnStyle = { width: '100%', padding: '14px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' };
const secondaryBtnStyle = { padding: '0 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const iconBtnStyle = { padding: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' };
const logoutBtnStyle = { display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '14px' };
const qrContainer = { marginTop: '25px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', textAlign: 'center' };
const resultsContainer = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' };
const metricsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' };
const metricCard = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9', fontSize: '14px', fontWeight: 'bold', gap: '5px' };
const timelineItem = { display: 'flex', gap: '15px', paddingBottom: '20px', borderLeft: '2px solid #e2e8f0', marginLeft: '6px', paddingLeft: '20px', position: 'relative' };
const timelineBullet = { position: 'absolute', left: '-7px', top: '0', width: '12px', height: '12px', background: '#2563eb', borderRadius: '50%', border: '2px solid #fff' };
const organicBadge = { display: 'flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #a7f3d0' };

export default TraceabilityDashboard;