import React, { useState } from 'react';
import { Tabs, Tab, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Auth = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, { username, password });
      setTab(1); // Switch to login tab after signup
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="background">
      <div className="card-container">
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ width: '100%', marginBottom: 2 }}>
          <Tab label="Sign Up" />
          <Tab label="Login" />
        </Tabs>
        {tab === 0 && (
          <form onSubmit={handleSignup} style={{ width: '100%' }}>
            <TextField label="Username" fullWidth className="styled-input" value={username} onChange={e => setUsername(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth className="styled-input" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <Typography color="error" align="center">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth className="styled-button">Sign Up</Button>
          </form>
        )}
        {tab === 1 && (
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <TextField label="Username" fullWidth className="styled-input" value={username} onChange={e => setUsername(e.target.value)} required />
            <TextField label="Password" type="password" fullWidth className="styled-input" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <Typography color="error" align="center">{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth className="styled-button">Login</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth; 
