import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4">
      <form onSubmit={handleSubmit} className="bg-[#0A0A0A] p-8 rounded-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        {error && <div className="text-red-400 mb-3">{error}</div>}
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mb-3 p-3 rounded bg-black/50 placeholder-gray-400" placeholder="Email" />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full mb-3 p-3 rounded bg-black/50 placeholder-gray-400" placeholder="Password" />
        <button className="w-full bg-yellow-500 text-black py-3 rounded font-bold">Sign in</button>
      </form>
    </div>
  );
};

export default AdminLogin;
