const express = require('express');
const db = require('../db/db');

const eclinicRouter = express.Router({mergeParams:true});

eclinicRouter.route('/')
.get(db.showDiseases);
eclinicRouter.route('/survey')
.get(db.getquestions);

eclinicRouter.route('/recommend')
.get(db.recommend);

module.exports = eclinicRouter;