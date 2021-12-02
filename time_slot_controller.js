//require('dotenv').config()
//const mongoose = require("mongoose");
//mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dentistimo0.vd9sq.mongodb.net/Dentistimo`);
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
var clinicId;
var dentistNo

// MQTT
client.on('connect', function() {
    console.log("Connected to Mqtt broker successfully" )
    client.subscribe(subscribeTopic, function (err) {
        if (!err) {
            console.log("Subscribed to " + subscribeTopic + " successfully")
            client.publish(subscribeTopic, 'July 21, 1983 01:15:00-clinicName', {qos:1} )
        }else{
            console.log(err.message);
        }
    })
})



client.on('message', (subscribeTopic, payload) => {
  console.log('Received Message:', subscribeTopic, payload.toString())
  //TODO - add error handling to below methods 
  readMessage(payload.toString)
  generateTimeSlots()
})

//**********************************************************************************************************************************/
// split message into "date" and "clinic"
//**********************************************************************************************************************************/

function readMessage (message) {
    message = '02 Dec 2021 09:32:00 GMT+1-clinicName' // = example
 
    var dateArray = new Array;
    var clinicArray = new Array;

    const n = message.search("-");
    console.log('Split: ' + n)
    let messageArray = message.split('')
    //console.log('Message Array: ' + messageArray)


    const messageLength = messageArray.length

    for(let i = 0; i < messageLength; i++){
        //console.log('Message array length: ' + n)
        if(i < n){
            //console.log(messageArray[i])
            dateArray.push(messageArray[i]) 
            //console.log(dateArray[i])
            /* if(i = n-1){
                date = new Date(dateArray.toString)
                day = date.getDay()
            } */
        }else if(i > n){
            clinicArray.push(messageArray[i])
            /* if(i = messageArray.length - 1){
                clinicId = clinicArray.toString
            } */ 
        } 
    }
    date = new Date(Date.parse(dateArray.join("")))
    var weekday = new Array("sunday", "monday", "tuesday", "wednesday",
                    "thursday", "friday", "saturday");

    day = weekday[date.getDay()];
    clinicId = clinicArray.toString()
}

//**********************************************************************************************************************************/
// Generate time slots based on information collected from the database and calculations made in other methods
//**********************************************************************************************************************************/

function generateTimeSlots() {
    // Access opening hours for specific day, for specific clinic from database
    var dayOpeningHours = '9:00-15:00' // = example
    dentistNo = 3 // = example

       /*  Clinic.findOne({clinicId: clinicId}, function(err, clinic){
            if (err) { 
                console.log(clinicId)
                res.status(500).json({"message": "get failed"}); 
                return next(err);
            }
            if (clinic == null) {
                res.status(404).json({"message": "clinic not found"});
            }
            console.log(clinic)
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
    }); */
     

    
    // Split the dayOpeningHours into 2 times then into min and hours
    splitTime(dayOpeningHours);
    
    //calculate how many 1 hour slots are in this day
    var OHinMin = ((endHour * 60) + endMin) - ((startHour * 60) + startMin)
    console.log(endHour)
    var slotNo = (OHinMin / 30) - 1
    console.log(slotNo)
    var timeSlots = new Array
    // generate timeslots based on above
    //create slots in loop from opening hour until ammout of slots is reached
    for(let i = 0; i <= slotNo; i++){
        var timeSlot = new TimeSlot();
        timeSlot.start = convertStartTime(i, startHour, startMin)
        timeSlot.end = convertEndTime(i, startHour, startMin)
        timeSlot.available = dentistNo
        timeSlot.date = date.toDateString()
        console.log(timeSlot)
        
        timeSlots.push(timeSlot)
    };
    console.log('Time Slots : ' + timeSlots)
}  

//**********************************************************************************************************************************/
// Split the dayOpeningHours into 2 times (opening and closing) then into min and hours for both
//**********************************************************************************************************************************/

function splitTime (dayOpeningHours){
    console.log('inside split time')
    let n = dayOpeningHours.search("-");
    console.log(n)
    let dayOpeningHoursArray = dayOpeningHours.split('')
    var startTimeArray = new Array
    var endTimeArray = new Array
    var startHourArray = new Array
    var startMinArray = new Array
    var endHourArray = new Array
    var endMinArray = new Array

    for(let i = 0; i < dayOpeningHoursArray.length; i++){
        if(i < n){
            startTimeArray.push(dayOpeningHoursArray[i])
        }else if(i > n){
            endTimeArray.push(dayOpeningHoursArray[i])
        }
    }
    const startSplit = startTimeArray.join("").search(":")
    console.log(startSplit)
    //const startSplit = startTimeArray.find(element => element == ':');
    const endSplit = endTimeArray.join("").search(":")

    //Split opening time into hour/min
    for(let i = 0; i < startTimeArray.length; i++){
        if(i < startSplit){
            startHourArray.push(startTimeArray[i])
/*             if(i = startTimeArray.length -1){
                startHour = parseInt(startHourArray.toString)
                console.log('start hour: ' + startHour.toString())
            } */
        }else if(i > startSplit){
            startMinArray.push(startTimeArray[i])
/*             if(i = startTimeArray.length - 1){
                startMin = parseInt(startMinArray.toString)
                console.log('start min int parse :' + startMin)
                console.log('start hour: ' + startMin.toString())
            } */
        }
    }
    startHour = parseInt(startHourArray.toString())
    startMin = parseInt(startMinArray.join(""))
    //Split closing time into hour/min
    for(let i = 0; i < endTimeArray.length; i++){
        if(i < endSplit){
            endHourArray.push(endTimeArray[i]) 
            
/*             if(i = endTimeArray.length -1){
                endHour = parseInt(endHourArray.toString)
                console.log('end hour: ' + endHour.toString())
            } */
        }else if(i > endSplit){
            endMinArray.push(endTimeArray[i])
/*             if(i = endTimeArray.length - 1){
                endMin = parseInt(endMinArray.toString)
                console.log('end min: ' + endMin.toString())
            } */
        }
    }
    endHour = parseInt(endHourArray.join(""))
    endMin = parseInt(endMinArray.join(""))
}

//**********************************************************************************************************************************/
// Convert start time from hours and miniutes to time format 
//**********************************************************************************************************************************/

function convertStartTime(i, startHour, startMin){

    startMin = startMin + (30 * i)

    var startTime

    if(startMin > 59){
        startMin = startMin / 60
        startHour += Math.floor(startMin) 
        var n = Math.trunc(startMin)
        startMin = (startMin) - n
        
        startMin = (((startMin / 100) * 60) * 100)
    }
    var trailingZero = ''
        if(startMin == 0){
            trailingZero = '0'
        }
    return startTime = startHour.toString() +':'+ startMin.toString() + trailingZero  
}

//**********************************************************************************************************************************/
// Convert end time from hours and miniutes to time format 
//**********************************************************************************************************************************/

function convertEndTime(i, endHour, endMin){

    endMin = endMin + (30 * (i + 1))
    var startTime

    if(endMin > 59){
        endMin = endMin / 60
        endHour += Math.floor(endMin) 
        var n = Math.trunc(endMin)
        endMin = (endMin) - n
        
        endMin = (((endMin / 100) * 60) * 100)
    }
    var trailingZero = ''
    if(endMin == 0){
        trailingZero = '0'
    }
    return startTime = endHour.toString() +':'+ endMin.toString() + trailingZero
}

//**********************************************************************************************************************************/
// Access appointments for specific clinic on specific date from database
//**********************************************************************************************************************************/

    //**Optional*/
    // For each appointment for the clinic, if there is an apponintment with the same start time as a 
    // time slot, subtract 1 from the appointments in the time slot for each appointment that matches the start time