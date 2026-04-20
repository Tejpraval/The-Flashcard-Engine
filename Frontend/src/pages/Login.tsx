import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { BrainCircuit } from 'lucide-react';
import { API_URL } from '../config';

const Login: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }
      
      onLogin(data.token);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '40px', maxWidth: '400px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
           <BrainCircuit size={48} className="text-gradient" />
        </div>
        <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Welcome to FlashMind
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          {isRegister ? 'Create your account to start learning faster.' : 'Login to jump back into your study sessions.'}
        </p>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <input 
              type="text" 
              className="input-field" 
              placeholder="Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          )}
          <input 
            type="email" 
            className="input-field" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <input 
            type="password" 
            className="input-field" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
          >
            {isRegister ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
