var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var AuthKey = new Schema({
    userId: { type: ObjectId },
    key: { type: String },
    access_token: { type: String },
    isActivated: { type: Boolean },
    createAt: { type: Date },
    status: { type: Boolean }
});

AuthKey.plugin(mongoosePaginate);

module.exports = mongoose.model('AuthKey', AuthKey);