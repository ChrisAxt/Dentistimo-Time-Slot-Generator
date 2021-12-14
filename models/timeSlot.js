var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeSlotSchema = new Schema({
    start: {type: String, required: 'Start time is required'},
    end: {type: String, required: 'End time is required'},
    available: {type: Number, required: 'Amount of timeSlots available is required'}, 
    date: {type: String, required: 'Date is required'}
});

module.exports = mongoose.model('timeSlot', timeSlotSchema);