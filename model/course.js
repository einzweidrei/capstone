var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var CourseSchema = new Schema({
    info: {
        name: { type: String },
        tuitionFees: { type: Number },
        routerLink: { type: String },
        summary: { type: String },
        content: { type: String }
    },
    createAt: {
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    updateAt: {
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    status: { type: Boolean }
});

CourseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Course', CourseSchema);