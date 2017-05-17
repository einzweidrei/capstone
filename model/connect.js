var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var ConnectSchema = new Schema({
    connect: {
        account: { type: ObjectId, ref: 'Account' },
        student: { type: ObjectId, ref: 'Student' }
    },
    createAt: { type: Date },
    updateAt: { type: Date },
    status: { type: Boolean }
});

ConnectSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Connect', ConnectSchema);