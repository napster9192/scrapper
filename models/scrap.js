var mongoose = require('mongoose');
var validUrl = require('valid-url');
var bluebird = require('bluebird');
mongoose.Promise = bluebird;

var Schema = mongoose.Schema;

var scrapSchema = new Schema({
	'name' : {type: String, required: true},
	'uri' : {
		type: String, 
		required: true,
		validate: {
          validator: function(v) {
            return validUrl.isUri(v) != undefined;
          },
          message: '{VALUE} is not a valid uri !'
        },
	},
	'last_execution' : {type: Date, default: null},
	'status' : {type: Boolean, default: false}
});

module.exports = mongoose.model('scrap', scrapSchema);
