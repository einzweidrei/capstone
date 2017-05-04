var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var Advisory = new Schema({
    info: {
        studentName: { type: String },
        parentName: { type: String },
        birthday: {
            year: { type: Number },
            month: { type: Number },
            day: { type: Number }
        },
        email: { type: String },
        city: { type: String },
        phone: { type: String },
        note: { type: String }
    },
    process: { type: String },
    createAt: {
        timestamp: { type: Date },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    updateAt: {
        timestamp: { type: Date },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    status: { type: Boolean }
});

Advisory.plugin(mongoosePaginate);

module.exports = mongoose.model('Advisory', Advisory);