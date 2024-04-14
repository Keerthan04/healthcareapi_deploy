const express = require('express');
const db = require('../db/db');

const doctorRouter = express.Router();

doctorRouter.route('/')
.get(db.getdoctorData)

    
doctorRouter.route('/dashboard/')
.get(db.docdashboardSend);


doctorRouter.route('/appointment/details')
.get(db.getdocpatientData);

doctorRouter.route('/appointment/prescribe')
.post(db.docPrescribe);

doctorRouter.route('/appointment/prescribetests')
.post(db.docTest);

doctorRouter.route('/appointment/status')
.post(db.docAppointmentStatus);


module.exports = doctorRouter;