'use strict';

var http = require('http');
var async = require('async');
var nodemailer = require('nodemailer');
var gameredemption = require('./gameredemption.model');

var email = {

	transporter : nodemailer.createTransport({

		auth: {
			user: '',
			pass: ''
		},

		service: 'Gmail'
	}),

	body : function(data){

		// Hello Firstname Lastname
		var body_text = "Hello ";
		body_text += data.firstname;
		body_text += data.lastname;
		body_text += '\n\n';
		
		// thank you for redeeming
		body_text += "thank you for redeeming";
		body_text += '\n\n';

		// // Tomb Raider Trilogy Bundle : INNO1-11111-22222-33333-44444
		body_text += data.bundlename;
		body_text += ' : ';
		body_text += data.redemptionkey;
		body_text += '\n';

		// // Here are your cd-keys:
		body_text += "\nHere are your cd-keys:\n\n";

		while(data.gametitles.length){
			var fifoitem = data.gametitles.shift();
			body_text += fifoitem.gamename;
			body_text += " : ";
			body_text += fifoitem.gamekey;
			body_text += "\n";
		}

		// Enjoy Gaming!
		body_text += "\n";
		body_text += 'Enjoy Gaming!';

		return body_text;
	},

	send : function(send){
		email.transporter.sendMail({
			subject: '✔  Your Keys! Have Arrived!',
			text : email.body(send.data),
			to: send.to,
			from: ''
		});
	}
};

var gamebundle = {

	// configure gamebundle server
	options : function(args){
		return{
			// no default
			headers: args.headers || '',
			// default port
			port: args.port || 9001,
			// default post
			method: args.method || 'POST',
			// default host
			host: args.host || 'localhost',
			// default path, no default api
			path: '/api/gamebundles/' + args.api,
		};
	 },

	headers: function(data){
		return{
			'Content-Type': 'application/json', 
			'Content-Length': data.length
		}
	 },

	post : {

		claim : function(redemptionkey, callback){

			var data = JSON.stringify(redemptionkey);

			var options = gamebundle.options({
				headers: gamebundle.headers(data),
				api: 'claim'
			});

			var httpreq = http.request(options, function (response) {
				response.setEncoding('utf8');

				var responseString = '';

				response.on('data', function (chunk) {
					responseString = chunk;
				});

				response.on('end', function() {

					// parse json string into object
					var responseobject = JSON.parse(responseString);
					
					callback(
						// did response return with an error property ?
						responseobject.hasOwnProperty('error') ? responseobject.error : null,
						// did response return with an error result ?
						responseobject.hasOwnProperty('result') ? responseobject.result : null
					);
				})
			});

			httpreq.write(data);
			httpreq.end();
		}
	 }
};

var gamerepo = {

	post : {

		claim : function(gametitle, callback){

			// create url params
			var param = gametitle.gametitle;

			// create post body properties
			var body = {
				timestamp : gametitle.timestamp
			};

			// create data for header options
			var data = JSON.stringify(body);

			// create http.request options
			var options = {

				// no default
				headers: {
					'Content-Type': 'application/json', 
					'Content-Length': data.length
				},

				// default port
				port: 9000,
				// default post
				method: 'POST',
				// default host
				host: 'localhost',
				// default path, no default api
				path: '/api/gamerepos/claim/' + param 
			};
   
			var httpreq = http.request(options, function (response) {

				response.setEncoding('utf8');

				var responseString = '';
				response.on('data', function (chunk) {
					responseString = chunk;
				});

				response.on('end', function() {

					// convert responseString to object
					var res = JSON.parse(responseString);

					// return
					return res.message
					// cakkback with error
					? callback(res.message, null)
					// callback with success
					: callback(null, res.result);
				});
			});

			httpreq.write(data);
			httpreq.end();	

		}
	 }
};

var AsyncLibrary = {
  each: function(query, callback){ 
    gamerepo.post.claim(query, function(err, found){
      callback(err, found);
    });
  }
};

/**
 * post url:port/api/game-redemption/ accepts post fields redemptionkey (String), 
 * usedstatus (String), firstname (String), lastname (String) email (String). 
 * sends email to customers, provided email, containing cd-keys.
 * @param {object} req 	- is an instance of http.IncomingMessage..
 * @param {object} res 	- and response is an instance of http.ServerResponse.
 */
exports.submit = function(req, res) {

	gameredemption.findOne({  redemptionkey : req.body.redemptionkey }, function(err, found){

        // handle error
        if(err) return handleError(res,err);

        // handle found
        if(found) return handleError(res,{message: ' duplicate entry found'});

        // post data to external gamebundle api
        gamebundle.post.claim(req.body, function(err, gamebundle_result){

        	// handle error
        	if(err) return handleError(res, err);

        	// handle not found
        	if (!gamebundle_result) return handleError(res,{message: ' could not redeem key'});

        	// create new game-repo request object, with timestamp requirement
        	for(var i = 0, gamerepo_request = []; i < gamebundle_result.gamelist.length; i++)
        		gamerepo_request.push({ timestamp : req.body.timestamp, gametitle : gamebundle_result.gamelist[i] });

        	// Binding a context to an iterator
			async.map(gamerepo_request, AsyncLibrary.each.bind(AsyncLibrary), function(err, result){
				
				// handle error
				if(err) return handleError(res,{message: ' error'});

				// handle not found
				if (!result) return handleError(res,{message: ' could not find gametitles'});

				// gather required properties for database entry
	        	var redemption_created = parse_form_redemption({
	        		req: req,
	        		submit: req.body,
	        		gamebundle : gamebundle_result,
	        		gametitledocuments: result
	        	});

	        	// save user entry
	        	gameredemption.create(redemption_created, function(err, doc){

	        		// send email to client
	        		if(!err) email.send({ to: req.body.email, data: {
	        			    bundlename: gamebundle_result.bundlename,
	        			    redemptionkey: req.body.redemptionkey,
	        			    firstname: req.body.firstname,
	        			    lastname: req.body.lastname,
	        			    gametitles: result
						}
        			});
	        		
					return err ? handleError(res,err) : res.json(201, { // handle err, else handle success
						redemption : redemption_created // return successful data from gamebundle
					});
	        	});
			});
        });
	});
};

// index get a list of game-bundle documents
exports.index = function(req, res) { 

	// find all gamebundle documents
    gameredemption.find({}, function(err, doc){

        // return query
        return err 
        // handle error
        ? handleError(res, err)
        // handle success
        : res.json(doc);

    });
 };

function handleError(res, err) {
  return res.send(500, err);
}

/**
 * Returns an array of entries to be store in redemptions collection.
 * @param {object} 	submit 				- is a collection form properties.
 * @param {object} 	req 				- is an instance of http.IncomingMessage.
 * @param {object} 	gamebundle 			- contains member properties {array} gamelist and {string} bundlename
 * @param {array} 	gametitledocuments 	- is an array of individual claimed gametitles documents.
 */
function parse_form_redemption(param){

	var save = param.submit;

	// create a timestamp property
	save.timestamp = Date.now();

	// create a browser header property
	save.browser = param.req.headers['user-agent'];

	// create a remoteAddress property
	save.remoteAddress = param.req.connection.remoteAddress;

	// create a bundlename property
    save.gamebundlename = param.gamebundle.bundlename;

    // create an array of entries
    for(var i = 0, array_of_entries = []; i < param.gametitledocuments.length; i++){
        array_of_entries.push( JSON.parse( JSON.stringify( save ) ) );
        array_of_entries[i].gametitle = param.gametitledocuments[i].gamename;
        array_of_entries[i].cdkey = param.gametitledocuments[i].gamekey;
        array_of_entries[i].usedstatus = true;
    }

	return array_of_entries;
}
