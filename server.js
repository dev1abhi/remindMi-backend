const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const alarmRoutes = require('./routes/alarmRoutes');
const userRoutes = require('./routes/userRoutes');
require("./schedulers/scheduler"); // Import scheduler

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/alarms", alarmRoutes);
app.use("/users", userRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});