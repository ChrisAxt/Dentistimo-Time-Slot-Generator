var TimeSlot = require('./models/timeSlot')

const mqtt = require('mqtt');

/** Different MQTT servers */
const LOCALHOST = `mqtt://localhost:1883`
const HOST = 'mqtt://test.mosquitto.org' //mosquitto test server address

/** Subscribed topics for MQTT */
const subscribeTopic = '/Team5/Dentistimo/GenerateTimeSlots'

/** Published topics for MQTT */
const publishTopic = '/Team5/Dentistimo/TimeSlots'

/** Error topics for MQTT */
const errorTopic = '/Team5/Dentistimo/TimeSlot/Error'

/** Defines the options used to connect to MQTT broker*/
const options = {
    clientId: 'Dentistimo Team5 - Time Slot Generator n°' + Math.random().toString(16).substr(2, 8),
    will: {
        topic: "Team5/Dentistimo/TimeSlotGenerator/LastWill",
        payload: "Time SlotGenerator has been disconnected from the system",
        qos: 1
    }
}

/**
 * Connects to the servers defined in the constants above
 * @type {MqttClient}
 */

const client = mqtt.connect(LOCALHOST, options) //Change the parameter between HOST or LOCALHOST if you want to connect to the mosquitto test broker or a local broker. For local, mosquitto needs to be installed and running

// Global variables 
var date;
var day;
var startHour;
var startMin;
var endHour;
var endMin;
var clinicId;
var dentistNo;
var data;
//duration of each time slot in min
const duration = 30;

/**
 * MQTT connection and subscribe to topic
 */

client.on('connect', function () {
    console.log("Connected to Mqtt broker successfully");
    client.subscribe(subscribeTopic, function (err) {
        if (!err) {
            console.log("Subscribed to " + subscribeTopic + " successfully");
        } else {
            console.log(err.message);
        }
    })
})

/**
 * MQTT on message recieved
 */
client.on('message', (subscribeTopic, payload) => {
    console.log('Received Message from:', subscribeTopic);

    if (payload.toString() === "") {
        console.log('Payload can not be empty!');
    } else {
        if (readMessage(payload.toString())) {
            generateTimeSlots();
        } else {
            console.log('Invalid JSON file');
        }
    }
})

/**
 * unsubscribes and end the connection to the broker
 */
module.exports.disconnect = function () {
    client.unsubscribe(subscribeTopic, console.log('Unsubscribing to ' + subscribeTopic))
    client.end()
}

/**
 * Parses incomming message
 * @param message 
 * @returns a boolean
 */
function readMessage(message) {
    var isValid = true;
    try {
        data = JSON.parse(message);
        date = new Date(Date.parse(data.date));
        var weekday = new Array("sunday", "monday", "tuesday", "wednesday",
            "thursday", "friday", "saturday");

        day = weekday[date.getDay()];
        clinicId = data.clinic._id;
    } catch (error) {
        console.error(error);
        client.publish(errorTopic, 'Parsing error: ' + error.toString());
        return false;
    }
    return isValid;
}

/**
 * Generates time slots based on the message recieved 
 */
function generateTimeSlots() {
    // Access opening hours for specific day, for specific clinic from stored Json object
    var dayOpeningHours = new String;
    dentistNo = data.clinic.dentists;

    switch (day.toLowerCase()) {
        case 'monday':
            dayOpeningHours = data.clinic.openinghours.monday;
            break;
        case 'tuesday':
            dayOpeningHours = data.clinic.openinghours.tuesday;
            break;
        case 'wednesday':
            dayOpeningHours = data.clinic.openinghours.wednesday;
            break;
        case 'thursday':
            dayOpeningHours = data.clinic.openinghours.thursday;
            break;
        case 'friday':
            dayOpeningHours = data.clinic.openinghours.friday;
            break;
        default:
    }

    // Split the dayOpeningHours into 2 times then into min and hours for each
    splitTime(dayOpeningHours);

    //calculate how many time slots are in this day according to the set duration
    var OHinMin = ((endHour * 60) + endMin) - ((startHour * 60) + startMin);
    var slotNo = (OHinMin / duration) - 1;
    var timeSlots = new Array;
    // generate timeslots based on above
    for (let i = 0; i <= slotNo; i++) {
        var timeSlot = new TimeSlot();
        timeSlot.start = convertTime(i, startHour, startMin, true);
        timeSlot.end = convertTime(i, startHour, startMin, false);
        timeSlot.available = dentistNo;
        timeSlot.date = date.toDateString();
        timeSlots.push(timeSlot);
    };
    if (timeSlots != null) {
        var mqttPayload = {
            clinicId: clinicId,
            timeSlots: timeSlots
        };
        client.publish(publishTopic, JSON.stringify(mqttPayload));
        console.log('published ' + timeSlots.length + ' timeSlots');
    }
}

/**
 * Splits time strings and converts into Hours and min for opening and closing times
 * @param dayOpeningHours 
 */
function splitTime(dayOpeningHours) {
    let n = dayOpeningHours.toString().search("-");
    let dayOpeningHoursArray = dayOpeningHours.split('');
    var startTimeArray = new Array;
    var endTimeArray = new Array;
    var startHourArray = new Array;
    var startMinArray = new Array;
    var endHourArray = new Array;
    var endMinArray = new Array;

    for (let i = 0; i < dayOpeningHoursArray.length; i++) {
        if (i < n) {
            startTimeArray.push(dayOpeningHoursArray[i]);
        } else if (i > n) {
            endTimeArray.push(dayOpeningHoursArray[i]);
        }
    }
    const startSplit = startTimeArray.join("").search(":");
    const endSplit = endTimeArray.join("").search(":");

    //Split opening time into hour/min
    for (let i = 0; i < startTimeArray.length; i++) {
        if (i < startSplit) {
            startHourArray.push(startTimeArray[i]);
        } else if (i > startSplit) {
            startMinArray.push(startTimeArray[i]);
        }
    }
    startHour = parseInt(startHourArray.join(""));
    startMin = parseInt(startMinArray.join(""));

    //Split closing time into hour/min
    for (let i = 0; i < endTimeArray.length; i++) {
        if (i < endSplit) {
            endHourArray.push(endTimeArray[i]);
        } else if (i > endSplit) {
            endMinArray.push(endTimeArray[i]);
        }
    }
    try {
        endHour = parseInt(endHourArray.join(""));
        endMin = parseInt(endMinArray.join(""));
    } catch (error) {
        console.log(error);
    }
}

/**
 * Parses hour and min into a time format
 * @param i 
 * @param startHour 
 * @param startMin 
 * @returns 
 */
function convertTime(i, hour, min, start) {

    if(start){
        min = min + (duration * i);
    }else{
        min = min + (duration * (i + 1))
    }

    if (min > 59) {
        min = min / 60;
        hour += Math.floor(min);
        var n = Math.trunc(min);
        min = (min) - n;
        min = (((min / 100) * 60) * 100);
    }
    var trailingZero = '';
    if (min == 0) {
        trailingZero = '0';
    }
    Math.ceil(min);
    return hour.toString() + ':' + min.toString() + trailingZero;
}