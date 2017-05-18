var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var KeySchema = new Schema({
    key: { type: String },
    createAt: { type: Date },
    updateAt: { type: Date },
    status: { type: Boolean }
});

// KeySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Key', KeySchema);