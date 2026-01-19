import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function Auth ()  {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer'); // Default role

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Sign Up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create the user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date().toISOString()
        });
        
        alert(`Account created as ${role}!`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={authContainer}>
      <form onSubmit={handleSubmit} style={authCard}>
        <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Join Eco-Tech'}</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          style={inputStyle} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          style={inputStyle} 
          required 
        />

        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>I am a:</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
              style={inputStyle}
            >
              <option value="consumer">Consumer (Scan & Verify)</option>
              <option value="producer">Producer (Register Batches)</option>
            </select>
          </div>
        )}

        <button type="submit" style={btnStyle}>
          {isLogin ? 'Login' : 'Create Account'}
        </button>

        <p 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ textAlign: 'center', cursor: 'pointer', color: '#3498db', marginTop: '15px', fontSize: '14px' }}
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

// Styles
const authContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' };
const authCard = { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' };
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };

export default Auth;