var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var timeSlotSchema = new Schema({
    openAppointmentsNo: {type: String},
    start: {type: time},
    end: {type: String},
    available: {type: Number}, 
    date: {type: date}
});

module.exports = mongoose.model('timeSlot', timeSlotSchema);