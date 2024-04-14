
const {takeCare} = require('../genai/ai');
const { Pool } = require('pg');
require('dotenv').config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: {
      require: true,
    },
  });


async function test (req,res) {
    const client = await pool.connect();
    try {
        const result = await client.query('select * from doctors');
        console.log(result);
        res.status(200).send(result);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    } finally {
        client.release();
    }
}

const slot_time = {
    1 : "9:00 AM - 10:00 AM",
    2 : "10:00 AM - 11:00 AM",
    3 : "11:00 AM - 12:00 PM",
    4 : "12:00 PM - 1:00 PM",
    5 : "1:00 PM - 2:00 PM",
    6 : "3:00 PM - 4:00 PM",
    7 : "4:00 PM - 5:00 PM",
    8 : "5:00 PM - 6:00 PM",
    9 : "6:00 PM - 7:00 PM",
    10 : "7:00 PM - 8:00 PM"
};

async function docusers(email) {
    const client = await pool.connect();
    console.log(email);
    try {
;
        const result = await client.query(`select email from doctors where email='${email}'`);//do this 
        console.log(result);
        
        if(result.rows.length === 0){//no user
            return null;
        }
        
        const Email = result.rows.map(Email => Email.email);
        console.log(Email);
        return Email[0];
    }
    catch (err) {
        console.log(err);
        throw err;
    }
    finally{
        client.release();
    }
}

async function docpassword(email){
    const client = await pool.connect();
    try{

        const result = await client.query(`SELECT password FROM doctors WHERE email = '${email}'`);
        const pass = result.rows.map(pass => pass.password);
        console.log(pass);
        return pass[0];
    }catch(err){
        console.log(err);
        throw err;
    }
    finally{
        client.release();
    }
}

async function doctor_id(email){
    const client = await pool.connect();
    try{
        const result = await client.query(`select doctor_id from doctors where email = '${email}'`);
        doctor_id = result.rows.map(doctor_id => doctor_id.doctor_id);
        console.log(doctor_id);
        return doctor_id[0];
    }catch(err){
        console.log(err);
        throw err;
    }
    finally{
        client.release();
    }
}
async function patusers(email) {
    const client = await pool.connect();
    try {

        const result  = await client.query(`select email from patients where email = '${email}'`);
        console.log(result);
        if(result.rows.length === 0){
            return null;
        }
        const Email = result.rows.map(Email => Email.email);
        console.log(Email);
        return Email[0];
    }
    catch (err) {
        console.log(err);
        throw err;
    }
    finally{
        client.release()
    }
}

async function patpassword(email){
    const client = await pool.connect();
    try{
        const result = await client.query(`select password from patients where email = '${email}'`);
        pass = result.rows.map(pass => pass.password);
        console.log(pass);
        return pass[0];
    }catch(err){
        console.log(err);
        throw err;
    }
    finally{
        client.release();
    }
}
async function patient_id(email){
    const client = await pool.connect();
    try{
        const result = await client.query(`select patient_id from patients where email = '${email}'`);
        patient_id = result.rows.map(patient_id => patient_id.patient_id);
        console.log(patient_id);
        return patient_id[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}

async function getpatientData(req, res) {
    console.log(req.Patient_ID);
    const client = await pool.connect();
    try {
        const id = req.Patient_ID; 
        const patient_info = await client.query(`SELECT patient_id,name,gender,contact,address,email FROM patients WHERE patient_id = '${id}'`);
        const medical_history = await client.query(`SELECT patient_id,diagnosis,date_of_diagnosis,treatment_given,family_history FROM medical_history WHERE patient_id = '${id}'`);
        
        const pat_tests = await pool.query(`select test_name,result,date_taken from tests_taken where patient_id = '${id}'`);

        if (patient_info.rows.length === 0) {
            return res.status(404).send({ error: 'Patient not found' });
        }

        const responseData = {
            patient_info: patient_info.rows[0], 
            medical_history: medical_history.rows.length > 0 ? medical_history.rows[0] : null,
         
            patient_taken_tests: pat_tests.rows.length > 0 ? pat_tests.rows : null
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


async function addpatientData(personal_array,medical_array,test_array) {
    console.log(personal_array,medical_array,test_array);
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT insert_patient($1, $2, $3, $4, $5, $6, $7)', [
            personal_array.name,
            personal_array.gender,
            personal_array.age,
            personal_array.contact,
            personal_array.address,
            personal_array.email,
            personal_array.password
        ]);
        console.log(result);
        // Extract the patient ID from the result
        const patientId = result.rows[0].insert_patient;
        console.log('Patient ID:', patientId);
        console.log(medical_array.treatment_given);
        const result2 = await client.query(`CALL insert_medical_history('${patientId}', '${medical_array.diagnosis}','${medical_array.date_of_diagnosis}', '${medical_array.treatment_given}', '${medical_array.family_history}' )`);
        console.log(result2);
        for (const test of test_array) {
            const result3 = await client.query('CALL insert_tests_taken($1, $2, $3, $4)', [
                patientId,
                test.test_name,
                test.result,
                test.date_taken
            ])
            console.log(result3);
        }
        return true;
    }
    catch(err) {
        console.error('Error:', err);
        return false;
    }
    finally{
        client.release();
    }
}

function validateFields(data, requiredKeys) {
    for (const key of requiredKeys) {
        if (!data.hasOwnProperty(key) || data[key] === null || data[key] === undefined || data[key] === '') {
            return false;
        }
    }
    return true;
}


async function dashboardSend(req, res) {
    const client = await pool.connect();
    try {
        const id = req.Patient_ID;
        console.log(id);
        const appointmentsResult = await client.query(`SELECT d.name as Doctor_name, a.Date_of_appointment, a.slot_no FROM appointments a JOIN doctors d ON a.doctor_id = d.doctor_id  WHERE a.patient_id = '${id}' AND status = 'pending'`);
        
        const prescriptionResult = await client.query(`SELECT p.medication_Name, p.dosage, p.frequency,d.name as Doctor_Name FROM prescriptions p JOIN doctors d ON p.doctor_id = d.doctor_id WHERE p.patient_id = '${id}'`);
   
        const testsResult = await client.query(`SELECT t.test_name, d.name as doctor_name,t.result as test_result FROM tests_recommended t JOIN doctors d ON t.doctor_ID = d.doctor_id WHERE t.patient_id = '${id}'`);
        const responseData = {
            appointments: appointmentsResult.rows.length > 0 ? appointmentsResult.rows : null,
            doctor_recommended_prescription: prescriptionResult.rows.length > 0 ? prescriptionResult.rows : null,
            doctor_recommended_tests: testsResult.rows.length > 0 ? testsResult.rows : null,
            slot_timings: slot_time
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}



async function availableDoctors(req, res) {
    const client = await pool.connect();
    try {
        const department = req.body.department;
        const date = req.body.date;
        console.log(date);
        console.log(department);
        
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        console.log(day);
        
        const doctors = await client.query(`SELECT d.doctor_id,d.name as doctor_name FROM opd_day as o NATURAL JOIN doctors as d WHERE o.opd_day = lower('${day}') AND d.department_name = '${department}'`);
        
        res.status(200).send({"available doctors": doctors.rows});
        
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}


async function appointmentSlots(req, res) {
    const client = await pool.connect();
    try {
        const docId = req.body.docID;
        const date = req.body.date;
       
        const slots = [1,2,3,4,5,6,7,8,9,10]
        const booked_slots_result = await client.query(`select slot_no from appointments a where a.doctor_id = '${docId}' and a.date_of_appointment = '${date}' and a.status = 'pending'`);
        const booked_slots = booked_slots_result.rows.map(row => row.slot_no);
        console.log(booked_slots);
        const availableSlots = slots.filter(slot => !booked_slots.includes(slot));
        
        const responseData ={
            available_slots : availableSlots,
            slot_timings: slot_time
        }
        res.status(200).send(responseData);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}



async function bookAppointment(req, res) {
    const client = await pool.connect();
    try {
        const patId = req.Patient_ID;
        const {slot_no, date, reason_of_appointment,docID} = req.body;
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        console.log(docID);
        console.log(patId);
       
        await client.query(`INSERT INTO appointments (doctor_id, patient_id,date_of_appointment, slot_no, status, reason) VALUES ('${docID}','${patId}','${date}','${slot_no}','pending','${reason_of_appointment}')`);
     
        res.status(201).send({ message: 'Appointment booked successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}



//eclinic section 
async function showDiseases(req,res){
    const client = await pool.connect();
    try{
        const diseases = await client.query('Select disease_id,disease_name from diseases');
        const diseaseID = diseases.rows.map(disease => disease.disease_id);
        const diseaseArray = diseases.rows.map(disease => disease.disease_name);
        res.status(200).send({"diseases are" : diseaseArray,"disease ids are" : diseaseID});
    }catch(err){
        res.status(500).send({ error: 'Internal Server Error' });
        console.log(err);
    }
    finally{
        client.release();
    }
}

async function getquestions(req,res){
    const client = await pool.connect();
    try{
        const {disease_id} = req.body;
        const questions = await client.query(`Select symptoms_questions from symptoms where disease_id = ${disease_id}`);
        console.log(questions);
        
        const questionArray = questions.rows.map(question => question.symptoms_questions);
        res.status(200).send({"questions are" : questionArray});
    }catch(err){
        res.status(500).send({ error: 'Internal Server Error' });
        console.log(err);
    }
    finally{
        client.release();
    }
}


async function recommend(req,res){
    const client = await pool.connect();
    try{
        const {disease_id,answers} = req.body;
       
        const severityresult = await client.query(`Select severity from diseases where disease_id = ${disease_id}`);
        const severity = severityresult.rows.map(severity => severity.severity)[0];
        console.log(severity);
        const questions = await client.query(`Select symptoms_questions from symptoms where disease_id = ${disease_id}`);
        const disease = await client.query(`Select disease_name from diseases where disease_id = ${disease_id}`);
        const questionArray = questions.rows.map(question => question.symptoms_questions);
        
        const genAItext = await takeCare(disease.rows.map(disease => disease.disease_name)[0], questionArray, answers,severity);
        res.status(200).send({"AItext":genAItext});
    }catch(err){
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}



async function getdoctorData(req, res) {
    const client = await pool.connect();
    try {
        const id = req.Doctor_ID; 
        const doctor_details = await client.query(`select doctor_id,name,department_name,email,	license_number,age,phone,specialization,experience,awards,publications from doctors where doctor_id = '${id}'`);
        
        if (doctor_details.rows.length === 0) {
            return res.status(404).send({ error: 'Doctor not found' });
        }
        
        res.status(200).send({'Doctor details': doctor_details.rows[0]});
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}


async function docdashboardSend(req, res) {
    const client = await pool.connect();
    try {
        const id = req.Doctor_ID;

        const appointmentsResult = await client.query(`SELECT p.patient_id,p.name as patient_name, a.Date_of_appointment, a.slot_no,a.reason FROM appointments a JOIN patients p ON a.patient_id = p.patient_id WHERE doctor_id = '${id}' AND status = 'pending'`);

        const appointmentIdentify = await client.query(`SELECT appointment_id,doctor_id,patient_id FROM appointments WHERE doctor_id = '${id}' AND status = 'pending'`);
        const responseData = {
            appointments: appointmentsResult.rows.length > 0 ? appointmentsResult.rows : null,
            IDs: appointmentIdentify.rows.length > 0 ? (appointmentIdentify.rows) : null,
            slot_timings : slot_time
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}


async function getdocpatientData(req, res) {
    const client = await pool.connect();
    try {
        const {appointment_id,doctor_id,patient_id}= req.body;
        const patient_info = await client.query(`SELECT patient_id,name,gender,contact,address,email FROM patients WHERE patient_id = '${patient_id}'`);
        const medical_history = await client.query(`SELECT patient_id,diagnosis,date_of_diagnosis,treatment_given,family_history FROM medical_history WHERE patient_id = '${patient_id}'`);
        
        const pat_tests = await pool.query(`select test_name,result,date_taken from tests_taken where patient_id = '${patient_id}'`);
        const doctor_recommended_tests = await client.query(`SELECT t.test_name, d.name as doctor_name,t.result as test_result  FROM tests_recommended t JOIN doctors d ON t.doctor_ID = d.doctor_id WHERE t.patient_id = '${patient_id}'`);

        if (patient_info.rows.length === 0) {
            return res.status(404).send({ error: 'Patient not found' });
        }
        
        const responseData = {
            patient_info: patient_info.rows[0], 
            medical_history: medical_history.rows.length > 0 ? medical_history.rows[0] : null,
            patient_taken_tests: pat_tests.rows.length > 0 ? pat_tests.rows : null,
            doctor_recommended_tests: doctor_recommended_tests.rows.length > 0 ? doctor_recommended_tests.rows : null
        };

        res.status(200).send(responseData);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    finally{
        client.release();
    }
}


async function docPrescribe(req,res){
    const client = await pool.connect();
    try{
        const {appointment_id,doctor_id,patient_id}= req.body;
       
        const {medication_name, dosage, frequency} = req.body;
        const response = await client.query(`INSERT INTO prescriptions(doctor_id,patient_id,medication_name,dosage,frequency) Values ('${doctor_id}','${patient_id}','${medication_name}','${dosage}','${frequency}')`); 
        if(response.rowCount === 0){
            return res.status(404).send({error:'Error while adding prescription'});
        }
        res.status(200).send({message:'Prescription added successfully'});
    }catch(err){
        console.log(err);
        res.status(500).send({error:'Internal Server Error'});
    }
    finally{
        client.release();
    }
}


async function docTest(req,res){
    const client = await pool.connect();
    try{
        const {appointment_id,doctor_id,patient_id}= req.body;
       
        const {test_name} = req.body;
        const response = await client.query(`INSERT INTO tests_recommended(doctor_id,patient_id,test_name,recommendation_date) VALUES('${doctor_id}','${patient_id}','${test_name}',CURRENT_DATE)`);
        console.log(response);
        if(response.rowCount === 0){
            return res.status(404).send({error:'Error while adding test'});
        }
        res.status(200).send({message:'Test added successfully'});

    }catch(err){
        console.log(err);
        res.status(500).send({error:'Internal Server Error'});
    }
    finally{
        client.release();
    }
}


async function docAppointmentStatus(req,res){
    const client = await pool.connect();
    try{
        const {appointment_id,doctor_id,patient_id}= req.body;
        const response = await client.query(`UPDATE appointments SET Status = 'done'  WHERE appointment_id= '${appointment_id}' and doctor_id = '${doctor_id}' and patient_id = '${patient_id}'`);
        console.log(response);
        if(response.rowCount === 0){
            return res.status(404).send({error:'Appointment not found'});
        }
        res.status(200).send({message:'Appointment status changed successfully'});
    }catch(err){
        console.log(err);
        res.status(500).send({error:'Internal Server Error'});
    }
    finally{
        client.release();
    }
}
module.exports = { docusers,docpassword,doctor_id,patient_id,patusers,patpassword,getpatientData, addpatientData, dashboardSend,availableDoctors,appointmentSlots,bookAppointment,getquestions,recommend,getdoctorData,docdashboardSend,getdocpatientData,docPrescribe,docTest,docAppointmentStatus,showDiseases,test};