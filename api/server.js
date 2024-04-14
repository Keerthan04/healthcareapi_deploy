const express = require('express');
const dotenv = require('dotenv')
const patientRouter = require('../routes/patients');
const doctorRouter = require('../routes/doctors');
const authRouter = require('../auth/auth');
const cors = require('cors');
const {verify_doctor} = require('../middleware/verify_doctor');
const{verify_patient} = require('../middleware/verify_patients');
const db = require('../db/db');
dotenv.config();
const PORT = process.env.DB_PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.get('/',(req,res)=>res.send("Welcome to api"));

app.use('/auth',authRouter);

app.use('/patients',verify_patient, patientRouter);
app.use('/doctors',verify_doctor, doctorRouter);

app.get('/test',db.test);

app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});

module.exports = app;