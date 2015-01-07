'use strict';

var http = require('http');
var nodemailer = require('nodemailer');
var gamebundle = require('./gamebundle.model');
var gen = require('../gamebundle-gen/gamebundle-gen.controller');

var email = {

	transporter : nodemailer.createTransport({

		auth: {
			user: '',
			pass: ''
		},

		service: 'Gmail'
	}),

	options : function(options){
		return{
			subject: '✔  Your Keys! Have Arrived!',
			from: '',
			text : options.text,
			to: options.to
		}
	},

	send : function(send){
		email.transporter.sendMail(email.options(send));
	}
};

/**
 * post url:port/api/game-bundle/ accepts post fields gamelist (CSV/String), 
 * merchant (String), merchant_prefix (String), bundlename (String), threshold 
 * (Number), count (Number). returns error response || success response
 * @param {object} req 	- is an instance of http.IncomingMessage..
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.create = function(req, res) {

    gamebundle.findOne({ bundlename: req.body.bundlename }, function(err, found){
        
        // handle error
        if(err) return handleError(res,err);

        // handle found
        if(found) return handleError(res,{message: ' duplicate entry found'});
        
    	// create gamebundle entries
    	var gamebundle_created = parse_form_gamebundle(req.body);
    	gamebundle.create(gamebundle_created, function(err, doc){
    		
			return err ? handleError(res,err) : res.json(201, { // handle err, else handle success
				gamebundle : gamebundle_created // return successful data from gamebundle
			});
		});

    });
 };

/**
 * get url:port/index returns an aggregated gamebundle document/s 
 * with the following properties: _id(bundlename), rdk , udk 
 * @param {object} 	req - is an instance of http.IncomingMessage..
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.index = function(req, res) { 

    // create base template aggregate document/s using $project
	gamebundle.aggregate({$project : { _id : '$_id', bundlename : '$bundlename'} }, function(err, aggregate){
        
        // handle error 
        if(err) return handleError(res, err);
		
		// create aggreate document/s of gamebundle for new return response property udk
		gamebundle.aggregate({$unwind:"$redemptions"},{$match:{"redemptions.status":true}},{ $group: { _id: "$_id", udk: { $sum: 1 } } }, function(err, aggregate_udk){

			// handle error 
	        if(err) return handleError(res, err);
			// create aggreate document/s of gamebundle for new return response property rdk
			gamebundle.aggregate({$unwind:"$redemptions"},{$match:{"redemptions.status":false}},{ $group: { _id: "$_id", rdk: { $sum: 1 } } }, function(err, aggregate_rdk){

				// handle error 
		        if(err) return handleError(res, err);

				// merge rdk property
				while(aggregate_rdk.length){
					for(var i = 0; i < aggregate.length; i++)
						if(aggregate_rdk[0] && aggregate[i]._id.toString() == aggregate_rdk[0]._id.toString())
							aggregate[i].rdk = aggregate_rdk.shift().rdk;
				};

				// merge udk property
				while(aggregate_udk.length){
					for(var i = 0; i < aggregate.length; i++)
						if(aggregate_udk[0] && aggregate[i]._id.toString() == aggregate_udk[0]._id.toString())
							aggregate[i].udk = aggregate_udk.shift().udk;
				};

				// respond with aggregated json
				res.json(aggregate); 
			});
		});
	});
 };

// show get an individual game-bundle document
exports.show = function(req, res) {

	// find game bundle by id
	gamebundle.findById(req.params.id, function (err, doc) {
		
		// handle error
		if(err) return handleError(res, err);
		
		// return query
		return !doc
		// handle gamebundle not found
		? res.send(404)
		// handle gamebundle found
		: res.json(doc);

	});
 };

/**
 * put url:port/:id is used to automatically make redemptionkey, and stores
 * to database gamebundle-dev at collection gamebundles where embedded field
 * redemptions, contains an array of objects, similar to { 'key' : string, 
 * "status" : boolean } and accepts the following properties: 
 * merchant_prefix, count, threshold
 * @param {object} 	req - is an instance of http.IncomingMessage..
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.update = function(req, res) {

    var update_entries = parse_form_update_gamebundle(req.body);

    // create a query
    var query_findOne = {
    	
    	_id: req.params.id,

    	redemptions : { 
    		$in : update_entries.redemptions
    	}
    };

    // create a query
    var query_update = {

    	_id: req.params.id

    };

    // create an update
    var update = { 

    	threshold : req.body.threshold,

    	$pushAll : { 

    		redemptions : update_entries.redemptions 
    	} 

	};

    gamebundle.findOne(query_findOne, function(err , found){

        // handle error
        if(err) return handleError(res,err);

        // handle found
        if(found) return handleError(res,{message: ' duplicate entry found'})
        
        // create gamerepoth document, handle error || create gamerepo document
        gamebundle.update( query_update, update, function(err,doc){

			// handle error
			if(err) return handleError(res, err);

			// return query
			return !doc
			// handle gamebundle not found
			? res.send(404)
			// handle gamebundle found
			: res.json(update_entries.redemptions);

	    });

    });

 };

/**
 * delete url:port/:id is used to delete a gamebundle document by id
 * @param {object} 	req - is an instance of http.IncomingMessage.
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.destroy = function(req,res){

	// find game bundle by id
	gamebundle.findById(req.params.id, function (err, doc) {

		// handle error
		if(err) return handleError(res, err);

		// handle gambundle not found
		if(!doc) return res.send(404); 

		// remove gamebundle
		doc.remove(function(err) { 

			// handl return
		    return err 
		    // handle remove document error
		    ? handleError(res, err) 
		    // handle remove document success
		    : res.send(204);

		});
	});
 };

/**
 * post url:port/claim/ is used to claim a redemptionkey, reponds with error || success and
 * dispatches email admin, if threshold is low. post accepts post fields: redemptionkey,
 * @param {object} 	req - is an instance of http.IncomingMessage.
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.claim = function(req, res) {

    gamebundle.findOne({ 'redemptions.key': req.body.redemptionkey }, function(err, found){
        
        // handle error
        if(err) return handleError(res,err);

	    // handle claimed response
        if(!found) return handleError(res,{error: ' redemption code is not avaliable or has been claimed'});

        // process threshold, will send an administrative email, if
        // comparison, is below threshold percentage
        process_threshold(found.bundlename);

        // create query
        var query = { 
        	_id: found['_id'], 
        	"redemptions.key": req.body.redemptionkey 
        };

        // create update
        var update = { $set: { "redemptions.$.status" : false } };

        // claim redemptionkey
		gamebundle.update(query, update, function(err,updated){
	
			if(err) handleError(res,{ message: ' error, could not update' });
	
			// create response object
			var respond = {
				gamelist : found.gamelist,
				bundlename : found.bundlename
			};

		    // send to claim response
		    res.json({ error : err, result : respond});
		});
    });
 };

function handleError(res, err) {
  return res.send(500, err);
 };

// returns an array of entries
function parse_form_gamebundle(args){

	var save = args;
	var redemptions = [];

	// create redemptionkeys
	var redemptionkeys = create_redemptionkeys({
		prefix : args.merchant_prefix,
		make : args.count
	});

	for(var i = 0; i < args.count; i++) {
		redemptions.push( { status : true, key : redemptionkeys[i] } );
	}

	// create redemptions property
	save.redemptions = redemptions;

	return save;
 };

// returns an array of entries
function parse_form_update_gamebundle(args){

	// create redemptionkeys
	var redemptionkeys = create_redemptionkeys({
		prefix : args.merchant_prefix,
		make : args.count
	});

    // create a save
	var save = args;

	// remove unformatted data from save
	delete save.redemptionkeys;
	
	// create a redemptions property of type array on save
	save.redemptions = [];

	for(var i = 0; i < redemptionkeys.length; i++) {
		save.redemptions.push( { status : true, key : redemptionkeys[i] } );
	}

	return save;
 };

// accepts, string or csv, returns an array of redemptionkeys
function parse_multiformat_redemptionkeys(data){
    
    // support unix/window compliance
    var gamekeys_array = data.replace( /\r\n/g, "," );
    gamekeys_array = gamekeys_array.replace( /\n/g, "," );
    gamekeys_array = gamekeys_array.replace( /\s/g, "," );
    gamekeys_array = gamekeys_array.split( "," );

    // check if last array is ""
    while(gamekeys_array[gamekeys_array.length - 1] == ""){
        gamekeys_array.pop();
    }

    return gamekeys_array;
 };

// accepts, string, returns an array of gametitles
function parse_gametitles(data){
    
    // support unix/window compliance
    var gametitle_array = data.replace( /\r\n/g, "," );
    gametitle_array = gametitle_array.replace( /\n/g, "," );
    gametitle_array = gametitle_array.replace( /,\s/g, "," );
    gametitle_array = gametitle_array.replace( /\s,/g, "," );
    gametitle_array = gametitle_array.split( "," );

    // check if last array is ""
    while(gametitle_array[gametitle_array.length - 1] == ""){
        gametitle_array.pop();
    }

    return gametitle_array;
 };

/**
 * processthreshold, will send an email to the admin, based on
 * 1-100%, if gamebundleth =< [(total unclaimed redemption-keys/ 
 * total redemption-keys) x 100] send email to admin to alert them.
 * @param {string} bundlename - the name of the bundle
*/
function process_threshold(bundlename){
	// get threshold, and total redemptionskeys
    gamebundle.findOne({'bundlename':bundlename}, function(err, doc){
    	// get formula values
    	var total = doc.redemptions.length;
    	var threshold = doc.threshold;
		// create aggreate document/s of gamebundle with count, of unclaimed
		gamebundle.aggregate({$unwind:"$redemptions"},{$match:{ "bundlename" : bundlename, "redemptions.status":true}},{ $group: { _id: "$bundlename", unclaimed: { $sum: 1 } } }, function(err, bundle){
			
			// if aggregate provides unclaimed
			var unclaimed = bundle[0].hasOwnProperty('unclaimed') 
			? bundle[0].unclaimed 
			: 0;
    		
    		if(unclaimed / total * 100 <= threshold)
    			email.send({ text: bundlename + ' is below threshold', to : 'kyle@innobyt.com' });
		});
    });
 };

// create redemptionkeys, encapuslating gen.create, accepts args.make and args.prefix where 
// make, is the number of times to make a redemptionkey and prefix default string requirement
function create_redemptionkeys(args){

    // create redemptionkeys
	var redemptionkeys = gen.create(args.make, args.prefix);

	// convert to array
    redemptionkeys = parse_multiformat_redemptionkeys(redemptionkeys);

    return redemptionkeys;
}
