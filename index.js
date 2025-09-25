
const express = require('express');
const mongoose = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON format in request body.' });
    }
    next(err);
});

// Routes
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/doctorRoutes'));
app.use('/api', require('./routes/doctorRequestRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));

// Unprotected route for all hospitals
const Hospital = require('./models/HospitalModel/hospital');
app.get('/api/all-hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find({});
        res.status(200).json({ hospitals });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
