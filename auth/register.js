const db = require('../db/db');

async function register(req, res) {
    const {personal_info,medical_history,tests_taken} = req.body;
    if ( !personal_info || !medical_history || !tests_taken) {
        return res.status(400).send({error: 'All fields are required'});
    }
    const email = personal_info.email;
    console.log(email);
    const email_check = await check_email(email);
    if (email_check) {
        return res.status(400).send({error: 'Email already exist'});
    }

    const result = await db.addpatientData(personal_info,medical_history,tests_taken);
    if(result === false){
        return res.status(400).send({error: 'Something went wrong'});
    }
    res.status(200).send({message: 'Patient added successfully'});
}

async function check_email(email){
    const email_got = await db.patusers(email);
    console.log('email got ',email_got);
    if(email_got === null){
        return false;
    }
    else{
        return true;
    }
}
module.exports = {register}