const express = require('express');
const { getpatientData, dashboardSend, availableDoctors,appointmentSlots,bookAppointment} = require('../db/db');



const eclinicRouter = require('./eclinic');
const patientRouter = express.Router();



patientRouter.use('/eclinic',eclinicRouter);

patientRouter.route('/')
.get(getpatientData)
    
patientRouter.route('/dashboard/')
.get(dashboardSend);

patientRouter.route('/appointments/').get(availableDoctors);

patientRouter.route('/bookappointments/')
.get(appointmentSlots)
.post(bookAppointment);

module.exports = patientRouter;