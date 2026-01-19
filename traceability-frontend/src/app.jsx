import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth.jsx';
import TraceabilityDashboard from './components/TraceabilityDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Eco-Tech...</div>;

  return (
    <div className="App">
      {user ? <TraceabilityDashboard /> : <Auth />}
    </div>
  );
}

export default App;