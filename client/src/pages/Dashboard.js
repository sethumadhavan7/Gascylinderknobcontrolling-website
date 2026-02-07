// import React, { useEffect, useState, useRef } from 'react';
// import { Typography, Button, CircularProgress } from '@mui/material';
// import axios from 'axios';
// import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
// import {
//   LineChart,
//   BarChart,
//   Line,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import '../App.css';

// const Dashboard = () => {
//   const [gasData, setGasData] = useState([]);
//   const [knobStatus, setKnobStatus] = useState('');
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [chartType, setChartType] = useState('bar');
//   const backoffRef = useRef(30000); // Start with 30 seconds
//   const intervalRef = useRef();

//   useEffect(() => {
//     let isFirstFetch = true;
//     let cancelled = false;

//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gas`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setGasData(res.data);

//         const knobRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/gas/knob`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setKnobStatus(knobRes.data.knobStatus);

//         backoffRef.current = 30000; // Reset backoff on success
//       } catch (err) {
//         setGasData([]);
//         setKnobStatus('UNKNOWN');
//         if (err.response && err.response.status === 429) {
//           backoffRef.current = Math.min(backoffRef.current * 2, 300000); // up to 5 min
//         }
//       }

//       if (isFirstFetch) {
//         setInitialLoading(false);
//         isFirstFetch = false;
//       }

//       if (!cancelled) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = setInterval(fetchData, backoffRef.current);
//       }
//     };

//     fetchData();
//     intervalRef.current = setInterval(fetchData, backoffRef.current);

//     return () => {
//       cancelled = true;
//       clearInterval(intervalRef.current);
//     };
//   }, []);

//   const latest = gasData[0] || {};
//   const latestValue = latest.gasValue ?? 'N/A';
//   const latestTime = latest.timestamp
//     ? new Date(latest.timestamp).toLocaleTimeString()
//     : '';

//   const getStatus = (val) => {
//     if (val > 600) return 'danger';
//     if (val > 300) return 'warning';
//     return 'safe';
//   };

//   return (
//     <div className="background">
//       {/* Optional floating cubes (if you use them elsewhere) */}
//       {/* <div className="cube" />
//       <div className="cube" />
//       <div className="cube" />
//       <div className="cube" />
//       <div className="cube" />
//       <div className="cube" /> */}

//       <div className="dashboard-wrapper">
//         <div className="card-container dashboard-main-card">
//           <h1 className="page-title">Gas Monitoring Dashboard</h1>

//           {initialLoading ? (
//             <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />
//           ) : (
//             <>
//               {/* Top Section */}
//               <div className="dashboard-top">
//                 {/* Current Gas Level */}
//                 <div className="card-container dashboard-card">
//                   <Typography variant="h6" className="card-title">
//                     Current Gas Level
//                   </Typography>
//                   <div className="card-center-column">
//                     <Gauge
//                       value={latestValue !== 'N/A' ? latestValue : 0}
//                       valueMin={0}
//                       valueMax={1023}
//                       sx={{ [`& .${gaugeClasses.valueText}`]: { fontSize: 32 } }}
//                       width={120}
//                       height={120}
//                       text={
//                         latestValue !== 'N/A'
//                           ? `${latestValue}`
//                           : 'N/A'
//                       }
//                     />
//                     <Typography
//                       variant="h5"
//                       style={{ fontWeight: 700, marginTop: 8 }}
//                     >
//                       {latestValue !== 'N/A'
//                         ? `${latestValue} ppm`
//                         : 'N/A'}
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       color="textSecondary"
//                       style={{ marginTop: 4 }}
//                     >
//                       Last updated: {latestTime}
//                     </Typography>
//                   </div>
//                 </div>

//                 {/* System Status */}
//                 <div className="card-container dashboard-card">
//                   <Typography variant="h6" className="card-title">
//                     System Status
//                   </Typography>
//                   <div style={{ marginBottom: 8 }}>
//                     {latestValue !== 'N/A' && (
//                       <Typography
//                         style={{
//                           color:
//                             getStatus(latestValue) === 'danger'
//                               ? '#d32f2f'
//                               : getStatus(latestValue) === 'warning'
//                               ? '#f9a825'
//                               : '#388e3c',
//                           fontWeight: 600,
//                         }}
//                       >
//                         {getStatus(latestValue) === 'danger' &&
//                           'DANGER: Critical gas levels!'}
//                         {getStatus(latestValue) === 'warning' &&
//                           'Warning: Elevated gas levels.'}
//                         {getStatus(latestValue) === 'safe' && 'Safe'}
//                       </Typography>
//                     )}
//                   </div>
//                   <Typography>
//                     Cylinder Knob:{' '}
//                     <span
//                       style={{
//                         color:
//                           knobStatus === 'CLOSED'
//                             ? '#d32f2f'
//                             : '#388e3c',
//                         fontWeight: 600,
//                       }}
//                     >
//                       {knobStatus}
//                     </span>
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     color="textSecondary"
//                     style={{ marginTop: 4 }}
//                   >
//                     Last updated: {latestTime}
//                   </Typography>
//                 </div>

//                 {/* Safety Thresholds */}
//                 <div className="card-container dashboard-card">
//                   <Typography variant="h6" className="card-title">
//                     Safety Thresholds
//                   </Typography>
//                   <div className="thresholds-chip-row">
//                     <div className="threshold-chip safe">
//                       Safe: Below 300 ppm
//                     </div>
//                     <div className="threshold-chip warn">
//                       Warning: 300–600 ppm
//                     </div>
//                     <div className="threshold-chip danger">
//                       Danger: Above 600 ppm
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Historical Gas Levels */}
//               <div className="card-container">
//                 <div className="chart-header">
//                   <Typography variant="h6">
//                     Historical Gas Levels (Last 24 Hours)
//                   </Typography>
//                   <div className="chart-toggle-buttons">
//                     <Button
//                       variant={
//                         chartType === 'line' ? 'outlined' : 'contained'
//                       }
//                       size="small"
//                       onClick={() => setChartType('line')}
//                     >
//                       Line
//                     </Button>
//                     <Button
//                       variant={
//                         chartType === 'bar' ? 'outlined' : 'contained'
//                       }
//                       size="small"
//                       onClick={() => setChartType('bar')}
//                     >
//                       Bar
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="chart-wrapper">
//                   <ResponsiveContainer width="100%" height="100%">
//                     {chartType === 'line' ? (
//                       <LineChart data={gasData.slice().reverse()}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="timestamp" tick={false} />
//                         <YAxis domain={[0, 1023]} />
//                         <Tooltip />
//                         <Line
//                           type="monotone"
//                           dataKey="gasValue"
//                           stroke="#1976d2"
//                           dot={false}
//                         />
//                       </LineChart>
//                     ) : (
//                       <BarChart data={gasData.slice().reverse()}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="timestamp" tick={false} />
//                         <YAxis domain={[0, 1023]} />
//                         <Tooltip />
//                         <Bar dataKey="gasValue" fill="#1976d2" />
//                       </BarChart>
//                     )}
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Recent Readings */}
//               <div className="card-container">
//                 <Typography variant="h6" style={{ marginBottom: 16 }}>
//                   Recent Readings
//                 </Typography>
//                 <div className="recent-readings-container">
//                   {gasData.slice(0, 6).map((reading, idx) => (
//                     <div
//                       key={idx}
//                       className="recent-reading-card"
//                     >
//                       <Typography
//                         variant="subtitle2"
//                         style={{
//                           color: '#f44336',
//                           fontWeight: 700,
//                           fontSize: 18,
//                         }}
//                       >
//                         {new Date(
//                           reading.timestamp
//                         ).toLocaleTimeString()}
//                       </Typography>
//                       <Typography
//                         variant="h6"
//                         style={{
//                           color: '#f44336',
//                           fontWeight: 700,
//                         }}
//                       >
//                         {reading.gasValue} ppm
//                       </Typography>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         style={{ marginTop: 2 }}
//                       >
//                         {new Date(
//                           reading.timestamp
//                         ).toLocaleDateString()}
//                       </Typography>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useEffect, useState, useRef } from 'react';
import { Typography, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/gas`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGasData(res.data);

        const knobRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/gas/knob`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setKnobStatus(knobRes.data.knobStatus);

        backoffRef.current = 30000;
      } catch (err) {
        setGasData([]);
        setKnobStatus('UNKNOWN');

        if (err.response && err.response.status === 429) {
          backoffRef.current = Math.min(
            backoffRef.current * 2,
            300000
          );
        }
      }

      if (isFirstFetch) {
        setInitialLoading(false);
        isFirstFetch = false;
      }

      if (!cancelled) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(
          fetchData,
          backoffRef.current
        );
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
  const latestTime = latest.timestamp
    ? new Date(latest.timestamp).toLocaleTimeString()
    : '';

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
            <CircularProgress
              sx={{ display: 'block', mx: 'auto', mt: 4 }}
            />
          ) : (
            <>
              {/* Top Section */}
              <div className="dashboard-top">
                {/* Current Gas Level */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">
                    Current Gas Level
                  </Typography>

                  <div className="card-center-column">
                    <Gauge
                      value={latestValue !== 'N/A' ? latestValue : 0}
                      valueMin={0}
                      valueMax={1023}
                      sx={{
                        [`& .${gaugeClasses.valueText}`]: {
                          fontSize: 32,
                        },
                      }}
                      width={120}
                      height={120}
                      text={
                        latestValue !== 'N/A'
                          ? `${latestValue}`
                          : 'N/A'
                      }
                    />

                    <Typography
                      variant="h5"
                      style={{ fontWeight: 700, marginTop: 8 }}
                    >
                      {latestValue !== 'N/A'
                        ? `${latestValue} ppm`
                        : 'N/A'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginTop: 4 }}
                    >
                      Last updated: {latestTime}
                    </Typography>
                  </div>
                </div>

                {/* System Status */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">
                    System Status
                  </Typography>

                  <div style={{ marginBottom: 8 }}>
                    {latestValue !== 'N/A' && (
                      <Typography
                        style={{
                          color:
                            getStatus(latestValue) === 'danger'
                              ? '#d32f2f'
                              : getStatus(latestValue) === 'warning'
                              ? '#f9a825'
                              : '#388e3c',
                          fontWeight: 600,
                        }}
                      >
                        {getStatus(latestValue) === 'danger' &&
                          'DANGER: Critical gas levels!'}
                        {getStatus(latestValue) === 'warning' &&
                          'Warning: Elevated gas levels.'}
                        {getStatus(latestValue) === 'safe' && 'Safe'}
                      </Typography>
                    )}
                  </div>

                  <Typography>
                    Cylinder Knob:{' '}
                    <span
                      style={{
                        color:
                          knobStatus === 'CLOSED'
                            ? '#d32f2f'
                            : '#388e3c',
                        fontWeight: 600,
                      }}
                    >
                      {knobStatus}
                    </span>
                  </Typography>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginTop: 4 }}
                  >
                    Last updated: {latestTime}
                  </Typography>
                </div>

                {/* Safety Thresholds */}
                <div className="card-container dashboard-card">
                  <Typography variant="h6" className="card-title">
                    Safety Thresholds
                  </Typography>

                  <div className="thresholds-chip-row">
                    <div className="threshold-chip safe">
                      Safe: Below 300 ppm
                    </div>
                    <div className="threshold-chip warn">
                      Warning: 300–600 ppm
                    </div>
                    <div className="threshold-chip danger">
                      Danger: Above 600 ppm
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Gas Levels */}
              <div className="card-container">
                <div className="chart-header">
                  <Typography variant="h6">
                    Historical Gas Levels (Last 24 Hours)
                  </Typography>

                  <div className="chart-toggle-buttons">
                    <Button
                      variant={chartType === 'line' ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => setChartType('line')}
                    >
                      Line
                    </Button>

                    <Button
                      variant={chartType === 'bar' ? 'outlined' : 'contained'}
                      size="small"
                      onClick={() => setChartType('bar')}
                    >
                      Bar
                    </Button>
                  </div>
                </div>

                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={gasData.slice().reverse()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={false} />
                        <YAxis domain={[0, 1023]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="gasValue"
                          stroke="#1976d2"
                          dot={false}
                        />
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
                <Typography variant="h6" style={{ marginBottom: 16 }}>
                  Recent Readings
                </Typography>

                <div className="recent-readings-container">
                  {gasData.slice(0, 6).map((reading, idx) => (
                    <div key={idx} className="recent-reading-card">
                      <Typography
                        variant="subtitle2"
                        style={{
                          color: '#f44336',
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {new Date(reading.timestamp).toLocaleTimeString()}
                      </Typography>

                      <Typography
                        variant="h6"
                        style={{
                          color: '#f44336',
                          fontWeight: 700,
                        }}
                      >
                        {reading.gasValue} ppm
                      </Typography>

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        style={{ marginTop: 2 }}
                      >
                        {new Date(reading.timestamp).toLocaleDateString()}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ IP CAMERA BUTTON (ONLY ADDITION) */}
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() =>
                    window.open('https://ipcam-2n8t.onrender.com/', '_blank')
                  }
                >
                  Open IP Cam
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

