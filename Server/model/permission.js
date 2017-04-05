var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PermissionSchema = new Schema({
    nameId: { type: String },
    read: { type: Boolean },
    create: { type: Boolean },
    update: { type: Boolean },
    delete: { type: Boolean }
});

module.exports = mongoose.model('Permission', PermissionSchema);