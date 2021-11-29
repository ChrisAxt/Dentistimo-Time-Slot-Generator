var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeSlotSchema = new Schema({
    start: {type: String},
    end: {type: String},
    available: {type: Number}, 
    date: {type: String}
});

module.exports = mongoose.model('timeSlot', timeSlotSchema);