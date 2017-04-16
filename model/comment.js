var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
    info: {
        content: { type: String },
        author: {
            type: ObjectId,
            ref: 'Account'
        },
        topic: {
            type: ObjectId,
            ref: 'Topic'
        }
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

CommentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Comment', CommentSchema);