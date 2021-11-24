var mqtt = require('mqtt')
var client = mqtt.connect('') // insert link
var mongoose = require('mongoose')
mongoose.connect('') // insert link
var TimeSlot = require('./models/timeSlot')

function timeSlotGenerator() {
    
  }

  /*

  Maybe only make a time slot when an appointment is made???

  (Maybe this to be done in it's own class)
  
  Recieve day and opening hours
  Extract each day's opening time into "day", "opening" and "closing" varibles 

  (Maybe this to be done in this class??)

  Calculate ammout of time slots for that day
  Save time slots for each day of the week (WHERE??) --- This will then be retrived to populate the calender 
  Repeat until the day is full of slots
  Send some status code to indicate success/failure

  What does the message recieved through MQTT look like?
  
    "openinghours": {
        mon:9:00-17:00,
        tue:8:00-17:00,
        wed:7:00-16:00,
        thu:9:00-17:00,
        fri:9:00-15:00
      } 

      OR

    mon:9:30-17:00 = 7.5 * 2 (split into 30 min slots) = 15

    570 - 1020 / 30 = 15
      
    -- Appointments to have an attribute "duration" and depending on the duration, 
       time slot(s) will be alocated and saved into the appointment.  
      
      
      
      
      
      
      
      
      
      */

  

  client.on('connect', function () {
    client.subscribe('generateTimeSlots')
  })
  
  client.on('message', function (topic, message) {
  

  })