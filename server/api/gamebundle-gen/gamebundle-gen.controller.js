'use strict';

var rs = require('random-strings');

// Initialise Game Bundle Key Creation with Prefix + 20 Random Letters.
// Result for each Game Bundle Key: MERCH-XXXXX-XXXXX-XXXXX-XXXXX

// Generate a Game Bundle Key.
exports.create = function(num, prefix){
	var redeemkey = "";
	for (var i = 0; i < num; i++){
// Display each result according to the amount of redemption codes required to be passed to merch(prefix)
		redeemkey += merch(prefix) + "\n";
		}
// After the final return, it will result as: MERCH-XXXXX-XXXXX-XXXXX-XXXXX
		return redeemkey;
};

/* Styling Prefix with Redemption Key. */
function merch(prefix){
// Adding - to the prefix, result: MERCH-
var m = prefix + "-";
// Generate 20 random human characters, result: XXXXXXXXXXXXXXXXXXXX
var c = rs.human(20);
// Insert "-" into every 5 digit indexing, result: XXXXX-XXXXX-XXXXX-XXXXX-
var sym = c.replace(/(.{5})/g,"$1-");
// Remove the last "-", result: XXXXX-XXXXX-XXXXX-XXXXX
var trim = sym.slice(0,-1);
// Merge prefix to the above result, result: MERCH-XXXXX-XXXXX-XXXXX-XXXXX
var merge = m + trim;
// Display final result, result: MERCH-XXXXX-XXXXX-XXXXX-XXXXX as an array (redemption Array)
return merge;
}

