var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var CMSSchema = new Schema({
    info: {
        title: { type: String },
        type: { type: String },
        priority: { type: String },
        summary: { type: String },
        imgUrl: { type: String },
        routerLink: { type: String },
        content: { type: String },
    },
    createAt: {
        timestamp: { type: String },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    updateAt: {
        timestamp: { type: String },
        year: { type: Number },
        month: { type: Number },
        day: { type: Number },
        hour: { type: Number },
        minute: { type: Number },
        second: { type: Number }
    },
    status: { type: Boolean }
});

CMSSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CMS', CMSSchema);