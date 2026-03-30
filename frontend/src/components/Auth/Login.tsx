import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { Layout, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await api.login({ username, password });
      login(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f8fafc' 
    }}>
      <div style={{ 
        width: '400px', 
        padding: '40px', 
        background: 'white', 
        borderRadius: '24px', 
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            background: '#eff6ff', 
            padding: '12px', 
            borderRadius: '16px', 
            display: 'inline-block',
            marginBottom: '16px'
          }}>
            <Layout color="#2563eb" size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Enter your credentials to access your workflows</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fff1f2', 
            color: '#e11d48', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '24px',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #ffe4e6'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: '1.5px solid #f1f5f9',
                background: '#f8fafc',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="Enter username"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: '1.5px solid #f1f5f9',
                background: '#f8fafc',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              background: '#2563eb', 
              color: 'white', 
              padding: '14px', 
              borderRadius: '12px', 
              border: 'none', 
              fontWeight: 600, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              transition: 'all 0.2s',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            <LogIn size={20} />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToRegister}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#2563eb', 
                fontWeight: 600, 
                cursor: 'pointer',
                padding: 0
              }}
            >
              Register now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
