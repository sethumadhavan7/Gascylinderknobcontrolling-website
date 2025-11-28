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
  const backoffRef = useRef(30000);
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
        backoffRef.current = 30000;
      } catch (err) {
        setGasData([]);
        setKnobStatus('UNKNOWN');
        if (err.response && err.response.status === 429) {
          backoffRef.current = Math.min(backoffRef.current * 2, 300000);
        }
      }
      if (isFirstFetch) {
        setInitialLoading(false);
        isFirstFetch = false;
      }
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

  const getStatus = (val) => {
    if (val > 600) return 'danger';
    if (val > 300) return 'warning';
    return 'safe';
  };

  return (
    <div className="background">
      <div className="dashboard-wrapper">
        <div className="card-container dashboard-main-card">
          <h1 className="page-title">Gas Monitoring Dashboard</h1>
          {initialLoading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
          ) : (
            <>
              {/* Top Section: Current Gas Level, System Status, Safety Thresholds */}
              <div className="dashboard-grid">
                {/* Current Gas Level */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">Current Gas Level</Typography>
                  <div className="gauge-container">
                    <Gauge
                      value={latestValue !== 'N/A' ? latestValue : 0}
                      valueMin={0}
                      valueMax={1023}
                      sx={{ [`& .${gaugeClasses.valueText}`]: { fontSize: 32 } }}
                      width={120}
                      height={120}
                      text={latestValue !== 'N/A' ? `${latestValue}` : 'N/A'}
                    />
                    <Typography variant="h5" className="gauge-value">{latestValue !== 'N/A' ? `${latestValue} ppm` : 'N/A'}</Typography>
                    <Typography variant="body2" color="textSecondary" className="update-time">Last updated: {latestTime}</Typography>
                  </div>
                </div>

                {/* System Status */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">System Status</Typography>
                  <div style={{ marginBottom: 8 }}>
                    {latestValue !== 'N/A' && (
                      <Typography className="status-text" style={{ color: getStatus(latestValue) === 'danger' ? '#d32f2f' : getStatus(latestValue) === 'warning' ? '#f9a825' : '#388e3c', fontWeight: 600 }}>
                        {getStatus(latestValue) === 'danger' && 'DANGER: Critical gas levels!'}
                        {getStatus(latestValue) === 'warning' && 'Warning: Elevated gas levels.'}
                        {getStatus(latestValue) === 'safe' && 'Safe'}
                      </Typography>
                    )}
                  </div>
                  <Typography className="knob-status">Cylinder Knob: <span style={{ color: knobStatus === 'CLOSED' ? '#d32f2f' : '#388e3c', fontWeight: 600 }}>{knobStatus}</span></Typography>
                  <Typography variant="body2" color="textSecondary" className="update-time">Last updated: {latestTime}</Typography>
                </div>

                {/* Safety Thresholds */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">Safety Thresholds</Typography>
                  <div className="threshold-badges">
                    <div className="threshold-badge safe-badge">Safe: Below 300 ppm</div>
                    <div className="threshold-badge warning-badge">Warning: 300-600 ppm</div>
                    <div className="threshold-badge danger-badge">Danger: Above 600 ppm</div>
                  </div>
                </div>
              </div>

              {/* Historical Gas Levels */}
              <div className="card-container chart-card">
                <div className="chart-header">
                  <Typography variant="h6" className="chart-title">Historical Gas Levels (Last 24 Hours)</Typography>
                  <div className="chart-buttons">
                    <Button variant={chartType === 'line' ? 'outlined' : 'contained'} size="small" className="chart-button" onClick={() => setChartType('line')}>Line</Button>
                    <Button variant={chartType === 'bar' ? 'outlined' : 'contained'} size="small" className="chart-button" onClick={() => setChartType('bar')}>Bar</Button>
                  </div>
                </div>
                <div className="chart-container">
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
                <Typography variant="h6" className="card-title">Recent Readings</Typography>
                <div className="readings-grid">
                  {gasData.slice(0, 6).map((reading, idx) => (
                    <div key={idx} className="reading-card">
                      <Typography variant="subtitle2" className="reading-time">{new Date(reading.timestamp).toLocaleTimeString()}</Typography>
                      <Typography variant="h6" className="reading-value">{reading.gasValue} ppm</Typography>
                      <Typography variant="body2" color="textSecondary" className="reading-date">{new Date(reading.timestamp).toLocaleDateString()}</Typography>
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
