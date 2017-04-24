var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var ContactSchema = new Schema({
    info: {
        name: { type: String },
        mail: { type: String },
        message: { type: String },
        register: [],
        workType: [],
        timeType: []
    },
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

ContactSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Contact', ContactSchema);