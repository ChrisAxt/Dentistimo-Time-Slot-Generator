# Time Slot generator

## Description

This component is part of the distributed system DENTISTIMO, a web application that offers a geolocalisation based dental care booking system.
The time slot generator takes care of generating 30 minutes time slots according to the opening hours of the selected clinic. More details can be found in the component diagram in the [documentation repository](https://git.chalmers.se/courses/dit355/test-teams-formation/team-5/team-4-project). 

## Component Responsibilities

- Listen to MQTT broker for a generate time slots request (Subscribed to: `/Team5/Dentistimo/GenerateTimeSlots`)
- Generate time slots based on opening hours from selected clinic
- Publish time slots to the availability checker (Published to: `/Team5/Dentistimo/TimeSlots`)

## Data input and output
### Data input

The component expects stringified json objects sent via MQTT. 

The json object should contain at least the following information: 

<b>example</b>

    { 
        "date": "Any parsable date format",
        "id": 1,
        "name": "Your Dentist",
        "dentists": 3,
        "openinghours": {
            "monday": "9:00-17:00",
            "tuesday": "8:00-17:00",
            "wednesday": "7:00-16:00",
            "thursday": "9:00-17:00",
            "friday": "9:00-15:00"
        }
    }

### Data output

The component sends stringified json objects.
The format is as follows:

The output contains the clinic's id as well as a collection of timeslots, the number of time slots will vary depending on the opening hours of the clinic.

<b>example</b>

    { 
        "clinicId": "",
        "timeslots":[
            {
            "_id": "61bc57e6ce0d87512e7329ab",
            "start": "9:00",
            "end": "9:30",
            "available": 3,
            "date": "Thu Dec 02 2021"
            },
            {
            "_id": "61bc57e6ce0d87512e7329ac",
            "start": "9:30",
            "end": "10:00",
            "available": 3,
            "date": "Thu Dec 02 2021"
            }
        ]
    }

## Installing and running

### Prerequisites:
#### MQTT
You need to have a running version of <b>MQTT</b> on your machine. Please refer to this [link](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwjG3fWb6NH0AhXpQvEDHSGLC2MQFnoECAMQAQ&url=https%3A%2F%2Fmosquitto.org%2Fdownload%2F&usg=AOvVaw2rLN-Os_zfUrtqeV1Lrunf) to download the mosquitto broker if you do not have any. 
#### Node.js
To download the latest version of node.js, please follow this [link](https://nodejs.org/en/download/)

### Instructions

| Step | Command |
| ------ | ------ |
| Start your MQTT broker on port 1883| This differs based on which broker, as well as your settings. Make sure the broker listens to port 1883. (Default port with mosquitto) |
| Clone this project on your machine | `git clone < SSH address or HTTPS address >` |
| Install necessary dependencies by running the following  | `npm install` |
| Go to the repo and run the following  | `npm start` |

In the window of your terminal, you should see a message similar to this:

`Connected to Mqtt broker successfully`<br>
`Subscribed to /Team5/Dentistimo/GenerateTimeSlots successfully`

The time slot generator is now ready to process your requests. 


