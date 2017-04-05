var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var FunctionSchema = new Schema({
    nameId: {type: String},
    type: {type: String}
});

module.exports = mongoose.model('Function', FunctionSchema);