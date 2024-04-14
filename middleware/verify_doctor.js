const jwt = require('jsonwebtoken');

require('dotenv').config();

function verify_doctor(req, res, next) {
    console.log(req.headers);
    console.log(req.headers['authorization']);
    console.log(req.Auth);
    if(!req.headers['authorization']){
        return res.status(401).send({
            auth: false,
            message: 'Unauthorized to access the page'
        });
    }
    const authorization = req.headers['authorization'];
    console.log(authorization);
    const token = authorization.split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).send({
            auth: false,
            message: 'Unauthorized to access the page'
        });
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
        
        if (err) {
            return res.status(401).send({
                auth: false,
                message: 'Unauthorized to access the page'
            });
        }
        console.log(decoded);
        
        if (decoded.role !== 'doctor') {
            //if not 
            return res.status(401).send({
                auth: false,
                message: 'Unauthorized to access the page'
            });
        }
        else{
            req.Doctor_ID = decoded.id;
            req.role = decoded.role;
            next();
        }
    });
}

module.exports = {verify_doctor};