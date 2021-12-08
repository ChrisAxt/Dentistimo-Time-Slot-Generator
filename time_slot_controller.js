var TimeSlot = require('./models/timeSlot')

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
var startHour;
var startMin;
var endHour;
var endMin;
var clinic;
var dentistNo;
//duration of each time slot in min
const duration = 30;

//**********************************************************************************************************************************/
// MQTT
//**********************************************************************************************************************************/

client.on('connect', function() {
    console.log("Connected to Mqtt broker successfully" )
    client.subscribe(subscribeTopic, function (err) {
        if (!err) {
            console.log("Subscribed to " + subscribeTopic + " successfully")
            var mqttPayload = '02 Dec 2021 09:32:00 GMT+1-{"id": 1,"name": "Your Dentist","owner": "Dan Tist","dentists": 3,"address": "Spannmålsgatan 20","city": "Gothenburg","coordinate": {"longitude": 11.969388,"latitude": 57.707619},"openinghours": {"monday": "9:00-17:00","tuesday": "8:00-17:00","wednesday": "7:00-16:00","thursday": "9:00-17:00","friday": "9:00-15:00"}}' // = example

            client.publish(subscribeTopic, mqttPayload, {qos:1} ) // For testing, should be removed
        }else{
            console.log(err.message);
        }
    })
})

client.on('message', (subscribeTopic, payload) => {
    console.log('Received Message:', subscribeTopic, payload.toString())
 
    if (payload.toString() === "") {
        console.log('Payload can not be empty!')
    } else {
        readMessage(payload.toString())
        generateTimeSlots()
    }
})

//**********************************************************************************************************************************/
// split message into "date" and "clinic"
//**********************************************************************************************************************************/

function readMessage (message) {

    var dateArray = new Array;
    var clinicArray = new Array;

    const n = message.search("-");
    let messageArray = message.split('')

    const messageLength = messageArray.length

    for (let i = 0; i < messageLength; i++) {
        if (i < n) {
            dateArray.push(messageArray[i])
        } else if (i > n) {
            clinicArray.push(messageArray[i])
        }
    }
    date = new Date(Date.parse(dateArray.join("")))
    var weekday = new Array("sunday", "monday", "tuesday", "wednesday",
        "thursday", "friday", "saturday");

    day = weekday[date.getDay()];
    clinic = JSON.parse(clinicArray.join(""))

}

//**********************************************************************************************************************************/
// Generate time slots based on information collected from the database and calculations made in other methods
//**********************************************************************************************************************************/

function generateTimeSlots() {
    // Access opening hours for specific day, for specific clinic from stored Json object
    var dayOpeningHours = new String 
    dentistNo = clinic.dentists 

    switch(day.toLowerCase()) {
        case 'monday':
          dayOpeningHours = clinic.openinghours.monday
          break;
        case 'tuesday':
            dayOpeningHours = clinic.openinghours.tuesday
          break;
          case 'wednesday':
            dayOpeningHours = clinic.openinghours.wednesday
          break;
          case 'thursday':
            dayOpeningHours = clinic.openinghours.thursday
          break;
          case 'friday':
            dayOpeningHours = clinic.openinghours.friday
          break;
        default:   
    }
    
    // Split the dayOpeningHours into 2 times then into min and hours for each
    splitTime(dayOpeningHours);
    
    //calculate how many time slots are in this day according to the set duration
    var OHinMin = ((endHour * 60) + endMin) - ((startHour * 60) + startMin)
    var slotNo = (OHinMin / duration) - 1
    var timeSlots = new Array
    // generate timeslots based on above
    for(let i = 0; i <= slotNo; i++){
        var timeSlot = new TimeSlot();
        timeSlot.start = convertStartTime(i, startHour, startMin)
        timeSlot.end = convertEndTime(i, startHour, startMin)
        timeSlot.available = dentistNo
        timeSlot.date = date.toDateString()
        timeSlots.push(timeSlot)
    };
    console.log('Time Slots : ' + timeSlots)
    //client.publish(subscribeTopic, timeSlots.toString(), {qos:1} )
}  

//**********************************************************************************************************************************/
// Split the dayOpeningHours into 2 times (opening and closing) then into min and hours for both
//**********************************************************************************************************************************/

function splitTime (dayOpeningHours){
    let n = dayOpeningHours.toString().search("-");
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
    const endSplit = endTimeArray.join("").search(":")

    //Split opening time into hour/min
    for(let i = 0; i < startTimeArray.length; i++){
        if(i < startSplit){
            startHourArray.push(startTimeArray[i])
        }else if(i > startSplit){
            startMinArray.push(startTimeArray[i])
        }
    }
    startHour = parseInt(startHourArray.join(""))
    startMin = parseInt(startMinArray.join(""))

    //Split closing time into hour/min
    for(let i = 0; i < endTimeArray.length; i++){
        if(i < endSplit){
            endHourArray.push(endTimeArray[i]) 
        }else if(i > endSplit){
            endMinArray.push(endTimeArray[i])
        }
    }
    endHour = parseInt(endHourArray.join(""))
    endMin = parseInt(endMinArray.join(""))
}

//**********************************************************************************************************************************/
// Convert start time from hours and miniutes to time format 
//**********************************************************************************************************************************/

function convertStartTime(i, startHour, startMin){

    startMin = startMin + (duration * i)
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
        Math.ceil(startMin)
    return startTime = startHour.toString() +':'+ startMin.toString() + trailingZero  
}

//**********************************************************************************************************************************/
// Convert end time from hours and miniutes to time format in string
//**********************************************************************************************************************************/

function convertEndTime(i, endHour, endMin){

    endMin = endMin + (duration * (i + 1))
    var endTime

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
    Math.ceil(endMin)
    return endTime = endHour.toString() +':'+ endMin.toString() + trailingZero
}