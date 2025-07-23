// import React, { useState } from 'react';
// import { TextField, Button, Typography, Box } from '@mui/material';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import '../App.css';

// const Signup = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, { username, password });
//       navigate('/login');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Signup failed');
//     }
//   };

//   return (
//     <div className="background">
//       <div className="card-container">
//         <Typography className="page-title" variant="h4">Sign Up</Typography>
//         <form onSubmit={handleSubmit} style={{ width: '100%' }}>
//           <TextField label="Username" fullWidth className="styled-input" value={username} onChange={e => setUsername(e.target.value)} required />
//           <TextField label="Password" type="password" fullWidth className="styled-input" value={password} onChange={e => setPassword(e.target.value)} required />
//           {error && <Typography color="error" align="center">{error}</Typography>}
//           <Button type="submit" variant="contained" color="primary" fullWidth className="styled-button">Sign Up</Button>
//         </form>
//         <Typography align="center" style={{ marginTop: '1.5rem' }}>
//           Already have an account?{' '}
//           <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
//             Log in
//           </Link>
//         </Typography>
//       </div>
//     </div>
//   );
// };

// export default Signup;  

import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, { username, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="background">
      {/* Floating cubes */}
      <div className="cube"></div>
      <div className="cube"></div>
      <div className="cube"></div>
      <div className="cube"></div>
      <div className="cube"></div>
      <div className="cube"></div>
      <div className="card-container">
        {/* Optional: Add your logo here */}
        {/* <img src="/logo192.png" alt="Logo" style={{ width: 60, marginBottom: 16 }} /> */}
        <Typography className="page-title" variant="h4">Sign Up</Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField label="Username" fullWidth className="styled-input" value={username} onChange={e => setUsername(e.target.value)} required />
          <TextField label="Password" type="password" fullWidth className="styled-input" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <Typography color="error" align="center">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth className="styled-button">Sign Up</Button>
        </form>
        <Typography align="center" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
            Log in
          </Link>
        </Typography>
      </div>
    </div>
  );
};

export default Signup;
