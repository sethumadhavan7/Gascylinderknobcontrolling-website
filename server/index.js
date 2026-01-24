// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// const app = express();
// app.set('trust proxy', 1); // trust first proxy for rate limiting

// // Security Middlewares
// app.use(helmet());
// app.use(cors({
//      origin: 'https://gas-frontend-el6y.onrender.com',
//      credentials: true
//    }));
// app.use(express.json());

// // Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// // Routes
// app.get('/', (req, res) => {
//   res.send('Gas Monitoring API Running');
// });

// const authRoutes = require('./routes/authRoutes');
// const gasRoutes = require('./routes/gasRoutes');
// app.use('/api/auth', authRoutes);
// app.use('/api/gas', gasRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: 'https://gas-frontend-el6y.onrender.com',
    credentials: true,
  })
);
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

// Root
app.get('/', (req, res) => {
  res.send('Gas Monitoring API Running');
});

// ✅ IP CAMERA STREAM PROXY (PRODUCTION SAFE)
app.get('/api/ipcam/stream', async (req, res) => {
  try {
    const ipCamUrl =
      'http://192.168.155.99:6677/videofeed?username=&password=';

    const response = await axios.get(ipCamUrl, {
      responseType: 'stream',
      timeout: 10000,
    });

    res.setHeader(
      'Content-Type',
      'multipart/x-mixed-replace; boundary=frame'
    );

    response.data.pipe(res);
  } catch (err) {
    console.error('IP Cam stream error:', err.message);
    res.status(500).send('IP Camera unavailable');
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const gasRoutes = require('./routes/gasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/gas', gasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
