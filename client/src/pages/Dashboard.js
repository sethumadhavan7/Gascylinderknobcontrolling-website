import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { LineChart, BarChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

const Dashboard = () => {
  const [gasData, setGasData] = useState([]);
  const [knobStatus, setKnobStatus] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const backoffRef = useRef(30000); // Start with 30 seconds
  const intervalRef = useRef();

  useEffect(() => {
    let isFirstFetch = true;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGasData(res.data);
        const knobRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/gas/knob`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKnobStatus(knobRes.data.knobStatus);
        backoffRef.current = 30000; // Reset backoff on success
      } catch (err) {
        setGasData([]);
        setKnobStatus('UNKNOWN');
        // If 429, increase backoff (max 5 min)
        if (err.response && err.response.status === 429) {
          backoffRef.current = Math.min(backoffRef.current * 2, 300000); // up to 5 min
        }
      }
      if (isFirstFetch) {
        setInitialLoading(false);
        isFirstFetch = false;
      }
      // Clear and set new interval with updated backoff
      if (!cancelled) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchData, backoffRef.current);
      }
    };
    fetchData();
    intervalRef.current = setInterval(fetchData, backoffRef.current);
    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
  }, []);

  const latest = gasData[0] || {};
  const latestValue = latest.gasValue ?? 'N/A';
  const latestTime = latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : '';
  // const latestDate = latest.timestamp ? new Date(latest.timestamp).toLocaleDateString() : '';

  // Safety thresholds
  const getStatus = (val) => {
    if (val > 600) return 'danger';
    if (val > 300) return 'warning';
    return 'safe';
  };

  return (
    <div className="background">
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <div className="card-container" style={{ maxWidth: 1200, margin: '2rem auto 1.5rem auto', padding: '2rem 2.5rem' }}>
          <h1 className="page-title">Gas Monitoring Dashboard</h1>
          {initialLoading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
          ) : (
            <>
              {/* Top Section: Current Gas Level, System Status, Safety Thresholds */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', marginBottom: 32 }}>
                {/* Current Gas Level */}
                <div className="card-container" style={{ flex: 1, minWidth: 280, margin: 0 }}>
                  <Typography variant="h6" style={{ marginBottom: 8 }}>Current Gas Level</Typography>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Gauge
                      value={latestValue !== 'N/A' ? latestValue : 0}
                      valueMin={0}
                      valueMax={1023}
                      sx={{ [`& .${gaugeClasses.valueText}`]: { fontSize: 32 } }}
                      width={120}
                      height={120}
                      text={latestValue !== 'N/A' ? `${latestValue}` : 'N/A'}
                    />
                    <Typography variant="h5" style={{ fontWeight: 700, marginTop: 8 }}>{latestValue !== 'N/A' ? `${latestValue} ppm` : 'N/A'}</Typography>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>Last updated: {latestTime}</Typography>
                  </div>
                </div>
                {/* System Status */}
                <div className="card-container" style={{ flex: 1, minWidth: 280, margin: 0 }}>
                  <Typography variant="h6" style={{ marginBottom: 8 }}>System Status</Typography>
                  <div style={{ marginBottom: 8 }}>
                    {latestValue !== 'N/A' && (
                      <Typography style={{ color: getStatus(latestValue) === 'danger' ? '#d32f2f' : getStatus(latestValue) === 'warning' ? '#f9a825' : '#388e3c', fontWeight: 600 }}>
                        {getStatus(latestValue) === 'danger' && 'DANGER: Critical gas levels!'}
                        {getStatus(latestValue) === 'warning' && 'Warning: Elevated gas levels.'}
                        {getStatus(latestValue) === 'safe' && 'Safe'}
                      </Typography>
                    )}
                  </div>
                  <Typography>Cylinder Knob: <span style={{ color: knobStatus === 'CLOSED' ? '#d32f2f' : '#388e3c', fontWeight: 600 }}>{knobStatus}</span></Typography>
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>Last updated: {latestTime}</Typography>
                </div>
                {/* Safety Thresholds */}
                <div className="card-container" style={{ flex: 1, minWidth: 280, margin: 0 }}>
                  <Typography variant="h6" style={{ marginBottom: 8 }}>Safety Thresholds</Typography>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}>Safe: Below 300 ppm</div>
                    <div style={{ background: '#ffa000', color: '#fff', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}>Warning: 300-600 ppm</div>
                    <div style={{ background: '#d32f2f', color: '#fff', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}>Danger: Above 600 ppm</div>
                  </div>
                </div>
              </div>

              {/* Historical Gas Levels (Last 24 Hours) */}
              <div className="card-container" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                  <Typography variant="h6">Historical Gas Levels (Last 24 Hours)</Typography>
                  <div>
                    <Button variant={chartType === 'line' ? 'outlined' : 'contained'} size="small" style={{ marginRight: 8 }} onClick={() => setChartType('line')}>Line Chart</Button>
                    <Button variant={chartType === 'bar' ? 'outlined' : 'contained'} size="small" onClick={() => setChartType('bar')}>Bar Chart</Button>
                  </div>
                </div>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={gasData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={false} />
                        <YAxis domain={[0, 1023]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="gasValue" stroke="#1976d2" dot={false} />
                      </LineChart>
                    ) : (
                      <BarChart data={gasData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={false} />
                        <YAxis domain={[0, 1023]} />
                        <Tooltip />
                        <Bar dataKey="gasValue" fill="#1976d2" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Readings */}
              <div className="card-container">
                <Typography variant="h6" style={{ marginBottom: 16 }}>Recent Readings</Typography>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {gasData.slice(0, 6).map((reading, idx) => (
                    <div key={idx} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '1rem 1.2rem', minWidth: 110, border: '2px solid #f44336', textAlign: 'center' }}>
                      <Typography variant="subtitle2" style={{ color: '#f44336', fontWeight: 700, fontSize: 18 }}>{new Date(reading.timestamp).toLocaleTimeString()}</Typography>
                      <Typography variant="h6" style={{ color: '#f44336', fontWeight: 700 }}>{reading.gasValue} ppm</Typography>
                      <Typography variant="body2" color="textSecondary" style={{ marginTop: 2 }}>{new Date(reading.timestamp).toLocaleDateString()}</Typography>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
