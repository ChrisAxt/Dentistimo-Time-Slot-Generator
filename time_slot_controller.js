require('dotenv').config()
const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);
//var router = express.Router();
var TimeSlot = require('./models/timeSlot')
//var Clinic = require('../models/clinic'); // try import model from clinic handler

const mqtt = require('mqtt');
/** Different MQTT servers */
const LOCALHOST = '' //TODO: fill with the local mqtt address
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

/** Subscribed topics for MQTT */
const subscribeTopic = '/Team5/Dentistimo/GenTimeSlots'

/** Published topics for MQTT */
const publishTopic = '/Team5/Dentistimo/TimeSlots'

/**
 * Connects to the servers defined in the constants above
 * @type {MqttClient}
 */
const client = mqtt.connect(HOST) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running


// Global variables 
var date;
var day;
var startHour
var startMin
var endHour
var endMin
var clinic;
var dentistNo

// MQTT
client.on('connect', function() {
    console.log("Connected to Mqtt broker successfully" )
    client.subscribe(subscribeTopic, function (err) {
        if (!err) {
           console.log("Subscribed to " + subscribeTopic + " successfully")
        }else{
            console.log(err.message);
        }
    })
})

client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
  readMessage(payload.toString)
  generateTimeSlots()
})

//**********************************************************************************************************************************/
// split message into "date" and "clinic"
//**********************************************************************************************************************************/

function readMessage (message) {
    message = 'July 21, 1983 01:15:00-clinicName' // = example
 
    var dateArray;
    var clinicArray;

    let n = message.search("-");
    let messageArray = message.split('')

    for(let i = 0; i < messageArray.length; i++){
        if(i < n){
            dateArray[i] = messageArray[i]
            if(i = n-1){
                date = new Date(dateArray.toString)
                day = date.getDay()
            }
        }else if(i > n){
            clinicArray[i] = messageArray[i]
            if(i = messageArray.length - 1){
                clinic = clinicArray.toString
            }
        }
    }
}

//**********************************************************************************************************************************/
// Generate time slots based on information collected from the database and calculations made in other methods
//**********************************************************************************************************************************/

function generateTimeSlots() {
    // Access opening hours for specific day, for specific clinic from database
    var dayOpeningHours = '9:00-15:00' // = example
    dentistNo = 3 // = example

    router.get('/api/users/clinicName/:name/openingHours', function (req, res, next){

        Clinic.findOne({clinicName: req.params.name}, function(err, user){
            if (err) { 
                console.log(clinicName)
                res.status(500).json({"message": "get failed"}); 
                return next(err);
            }
            if (clinic == null) {
                res.status(404).json({"message": "clinic not found"});
            }
            res.status(200).json(clinic);
            var openingHours = clinic.openingHours
            // Access amount of dentists for specific clinic from database
            dentistNo = clinic.dentists

        switch(day) {
            case 'Monday':
              dayOpeningHours = openingHours.Monday
              break;
            case 'Tuesday':
                dayOpeningHours = openingHours.Tuesday
              break;
              case 'Wednesday':
                dayOpeningHours = openingHours.Wednesday
              break;
              case 'Thursday':
                dayOpeningHours = openingHours.Thursday
              break;
              case 'Friday':
                dayOpeningHours = openingHours.Friday
              break;
            default:   
        }
    });
     
})
    
    // Split the dayOpeningHours into 2 times then into min and hours
    splitTime(dayOpeningHours);
    
    //calculate how many 1 hour slots are in this day
    var OHinMin = ((endHour * 60) + endMin) - ((startHour * 60) + startMin)
    var slotNo = OHinMin / 30
    var timeSlots;
    // generate timeslots based on above
    //create slots in loop from opening hour until ammout of slots is reached
    for(let i = 0; i <= slotNo; i++){
        var timeSlot = new TimeSlot();
        timeSlot.start = convertStartTime(i, startHour, startMin)
        timeSlot.end = convertEndTime(i, endHour, endMin)
        timeSlot.available = this.dentistNo
        timeSlot.date = this.date
        
        timeSlot[i] = this.timeSlot;
    };
    console.log(timeSlots)
}  

//**********************************************************************************************************************************/
// Split the dayOpeningHours into 2 times (opening and closing) then into min and hours for both
//**********************************************************************************************************************************/

function splitTime (dayOpeningHours){

    let n = dayOpeningHours.search("-");
    let dayOpeningHoursArray = dayOpeningHours.split('')
    var startTimeArray
    var endTimeArray
    var startHourArray
    var startMinArray
    var endHourArray
    var endMinArray

    for(let i = 0; i < dayOpeningHoursArray.length; i++){
        if(i < n){
            startTimeArray[i] = dayOpeningHoursArray[i]
        }else if(i > n){
            endTimeArray[i] = dayOpeningHoursArray[i]
        }
    }
    const startSplit = startTimeArray.find(element => element == ':');
    const endSplit = endTimeArray.find(element => element == ':');

    //Split opening time into hour/min
    for(let i = 0; i < startTimeArray.length; i++){
        if(i < startSplit){
            startHourArray[i] = startTimeArray[i]
            if(i = startTimeArray.length -1){
                startHour = parseInt(startHourArray.toString)
            }
        }else if(i > startSplit){
            startMinArray[i] = startTimeArray[i]
            if(i = startTimeArray.length - 1){
                startMin = parseInt(startMinArray.toString)
            }
        }
    }
    //Split closing time into hour/min
    for(let i = 0; i < endTimeArray.length; i++){
        if(i < endSplit){
            endHourArray[i] = endTimeArray[i]
            if(i = endTimeArray.length -1){
                endHour = parseInt(endHourArray.toString)
            }
        }else if(i > endSplit){
            endMinArray[i] = endTimeArray[i]
            if(i = endTimeArray.length - 1){
                endMin = parseInt(endMinArray.toString)
            }
        }
    }
}

//**********************************************************************************************************************************/
// Convert start time from hours and miniutes to time format 
//**********************************************************************************************************************************/

function convertStartTime(i, startHour, startMin){

    startMin = startMin + (30 * (i + 1))
    var startTime

    if(startMin > 59){
        Math.floor(startHour =+ (startMin / 60)) 
        startMin = startMin - Math.floor(startMin / 60)
        startMin = (((startMin / 100) * 60) * 100)
    }
    return startTime = startHour.toString + startMin.toString  
}

//**********************************************************************************************************************************/
// Convert end time from hours and miniutes to time format 
//**********************************************************************************************************************************/

function convertEndTime(i, endHour, endMin){

    endMin = endMin + (30 * (i + 1))
    var startTime

    if(endMin > 59){
        Math.floor(endHour =+ (endMin / 60)) 
        endMin = endMin - Math.floor(endMin / 60)
        endMin = (((endMin / 100) * 60) * 100)
    }
    return startTime = endHour.toString + endMin.toString  
}

//**********************************************************************************************************************************/
// Access appointments for specific clinic on specific date from database
//**********************************************************************************************************************************/

    //**Optional*/
    // For each appointment for the clinic, if there is an apponintment with the same start time as a 
    // time slot, subtract 1 from the appointments in the time slot for each appointment that matches the start time
    

