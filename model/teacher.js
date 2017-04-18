var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var TeacherSchema = new Schema({
    info: {
        name: {
            firstName: { type: String },
            lastName: { type: String }
        },
        birthday: {
            year: { type: Number },
            month: { type: Number },
            day: { type: Number }
        },
        address: {
            street: { type: String },
            block: { type: String },
            district: { type: String }
        },
        phone: { type: String },
        governmentId: { type: String },
        nationality: { type: String },

        // thong tin can hoi lai
        // certificate: { type: String },
        // experience: { type: String },
    },
    classes: [
        {
            class: { type: ObjectId, ref: 'Class' }
        }
    ],
    attendances: [
        {

        }
    ],
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

TeacherSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Teacher', TeacherSchema);