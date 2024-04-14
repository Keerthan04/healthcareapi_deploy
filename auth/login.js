const db = require('../db/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function login(req,res){
    try{
        const{email,password,role}=req.body;
        //if no username,password,role
        console.log(email,password,role);
        if(!email || !password || !role ){
            res.status(400).send({message:"All fields are required"});
            return;
        }
        //seeing for role of each user
        if(role==='doctor'){
            const user = await db.docusers(email);
            console.log(user);
            if(!user){
                res.status(401).send({message:"Invalid Email Address(User doesnt Exist)"});
                return;
            }
            //checking password
            const pass = await db.docpassword(email);
            console.log(pass);
            //check if same password
            if(pass === password){
                const doctor_id = await db.doctor_id(email);
                res.status(200).send({message:"Login Successful",token:create_jwt(doctor_id,role)});
                return ;
            }
            else{
                res.status(401).send({message:"Invalid Password"});
            }
        }
        
        else if(role === "patient"){
            const user = await db.patusers(email);
            console.log(user);
            if(!user){
                res.status(401).send({message:"Invalid Email Address(User doesnt Exist)"});
                return;
            }
            const pass = await db.patpassword(email);
            console.log(pass);
            if(pass === password){
                
                const patient_id = await db.patient_id(email);

                res.status(200).send({message:"Login Successful",token:create_jwt(patient_id,role)});
                return ;
            }
            else{
                res.status(401).send({message:"Invalid Password"});
            }
        }
    }catch(err){
        console.log(err);
    }
}

function create_jwt(id,role){
    return jwt.sign({id,role},process.env.JWT_SECRET_KEY);
}


module.exports = {login};