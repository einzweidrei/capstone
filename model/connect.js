var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var ConnectSchema = new Schema({
    connect: {
        account: { type: ObjectId, ref: 'account' },
        student: { type: ObjectId, ref: 'student' }
    },
    createAt: {
        timestamp: { type: Date }
    },
    updateAt: {
        timestamp: { type: Date }
    },
    status: { type: Boolean }
});

ConnectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Connect', ConnectSchema);