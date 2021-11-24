var mqtt = require('mqtt')
var client = mqtt.connect('') // insert link
var mongoose = require('mongoose')
mongoose.connect('') // insert link
var TimeSlot = require('./models/timeSlot')
var date;
var day;
var clinic;


const topic = '/timeSlot/openingHours'
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
/* Use this when publishing
   client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error) => {
    if (error) {
      console.error(error)
    }
  }) */
})
client.on('message', (topic, payload) => {
  console.log('Received Message:', topic, payload.toString())
  readMessage(payload.toString)
  generateTimeSlots()
})

// split message into "date" and "clinic"
function readMessage (message) {
    message = 'July 21, 1983 01:15:00-clinicName' // = example
 
    var dateArray;
    var clinicArray;

    let n = message.search("-");
    let messageArray = message.split('')

/*      for(let i = 0; i < n; i++){
        dateArray[i] = messageArray[i]
        if(i = n-1){
            date = new Date(dateArray.toString)
            day = date.getDay()
        }
    } 
    for(let i = n + 1; i < messageArray.length; i++){
        clinicArray[i] = messageArray[i]
        if(i = n-1){
            clinic = clinicArray.toString
        }
    } */

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

function generateTimeSlots() {
    // Access opening hours for specific day, for specific clinic from database
    var dayOH = '9:00-15:00' // = example
    // Access amount of dentists for specific clinic from database
    var dentistNo = 3 // = example
    // generate timeslots based on above


    // Split the dayOH into 2 times then into min and hours
    let n = dayOH.search("-");
    let dayOHArray = dayOH.split('')

    var startTimeArray
    var endTimeArray
    var startHour
    var startMin
    var endHour
    var endMin

    for(let i = 0; i < dayOHArray.length; i++){
        if(i < n){
            startTimeArray[i] = dayOHArray[i]
        }else if(i > n){
            endTimeArray[i] = dayOHArray[i]
        }
    }
    const startSplit = startTimeArray.find(element => element == ':');
    const endSplit = endTimeArray.find(element => element == ':');
    var startHourArray
    var startMinArray
    var endHourArray
    var endMinArray

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
        if(i < startSplit){
            endHourArray[i] = endTimeArray[i]
            if(i = endTimeArray.length -1){
                endHour = parseInt(endHourArray.toString)
            }
        }else if(i > startSplit){
            endMinArray[i] = endTimeArray[i]
            if(i = endTimeArray.length - 1){
                endMin = parseInt(endMinArray.toString)
            }
        }
    }





}


    // Access appointments for specific clinic from database
    // For each appointment for the clinic, if there is an apponintment with the same start time as a 
    // time slot, subtract 1 from the appointments in the time slot
    

