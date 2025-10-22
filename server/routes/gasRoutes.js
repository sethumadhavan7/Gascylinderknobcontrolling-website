// const express = require('express');
// const Gas = require('../models/gasModel');
// const sendSMS = require('../utils/sendSMS');
// const auth = require('../middleware/authMiddleware');

// const router = express.Router();

// // POST /api/gas - ESP8266 posts gas data
// router.post('/', async (req, res) => {
//   const { gasValue } = req.body;
//   if (typeof gasValue !== 'number') return res.status(400).json({ message: 'Invalid gas value' });
//   const knobStatus = gasValue > 500 ? 'CLOSED' : 'OPEN';
//   try {
//     const gas = new Gas({ gasValue, knobStatus });
//     await gas.save();
//     // Send SMS if threshold exceeded
//     if (gasValue > 500) {
//       await sendSMS(`ALERT: Gas value exceeded! Value: ${gasValue}`, '+919677454080');
//     }
//     res.status(201).json({ message: 'Gas data saved', knobStatus });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Allow CORS preflight for POST from ESP8266
// router.options('/', (req, res) => { res.sendStatus(200); });

// // GET /api/gas - Get latest gas data (for dashboard polling)
// router.get('/', auth, async (req, res) => {
//   try {
//     const latest = await Gas.find().sort({ timestamp: -1 }).limit(20); // last 20 readings
//     res.json(latest);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET /api/gas/knob - Get current knob status
// router.get('/knob', auth, async (req, res) => {
//   try {
//     const latest = await Gas.findOne().sort({ timestamp: -1 });
//     res.json({ knobStatus: latest ? latest.knobStatus : 'UNKNOWN' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router; 


const express = require('express');
const Gas = require('../models/gasModel');
const sendSMS = require('../utils/sendSMS');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/gas - ESP8266 posts gas data
router.post('/', async (req, res) => {
  const { gasValue } = req.body;

  if (typeof gasValue !== 'number') {
    return res.status(400).json({ message: 'Invalid gas value' });
  }

  try {
    // Fetch the latest gas data entry
    const latest = await Gas.findOne().sort({ timestamp: -1 });
    let knobStatus = latest ? latest.knobStatus : 'OPEN';

    // Once CLOSED, it must remain CLOSED
    if (knobStatus !== 'CLOSED' && gasValue > 500) {
      knobStatus = 'CLOSED';
      await sendSMS(
        `🚨 ALERT: Gas value exceeded! Value: ${gasValue}. Knob has been CLOSED for safety.`,
        '+919677454080'
      );
    }

    // Save current reading
    const gas = new Gas({ gasValue, knobStatus });
    await gas.save();

    res.status(201).json({ message: 'Gas data saved', knobStatus });
  } catch (err) {
    console.error('Error saving gas data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Allow CORS preflight for POST from ESP8266
router.options('/', (req, res) => {
  res.sendStatus(200);
});

// GET /api/gas - Get latest gas data (for dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const latest = await Gas.find().sort({ timestamp: -1 }).limit(20); // last 20 readings
    res.json(latest);
  } catch (err) {
    console.error('Error fetching gas data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/gas/knob - Get current knob status
router.get('/knob', auth, async (req, res) => {
  try {
    const latest = await Gas.findOne().sort({ timestamp: -1 });
    res.json({ knobStatus: latest ? latest.knobStatus : 'UNKNOWN' });
  } catch (err) {
    console.error('Error fetching knob status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/gas/reset - Manual reset (Authorized only)
router.post('/reset', auth, async (req, res) => {
  try {
    const gas = new Gas({ gasValue: 0, knobStatus: 'OPEN' });
    await gas.save();
    res.json({ message: 'Knob manually reset to OPEN' });
  } catch (err) {
    console.error('Error resetting knob:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
