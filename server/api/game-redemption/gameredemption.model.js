'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var gameredemption = new Schema({
    gamebundlename  : String,
    redemptionkey  	: String,
    usedstatus      : String,
	gametitle		: String,
    firstname       : String,
    timestamp       : String,
    lastname        : String,
    browser         : String,
    userip          : String,
    email           : String,
    cdkey           : String
});

module.exports = mongoose.model('gameredemption', gameredemption);