const { response } = require("express");
const { eventing } = require("../models/event.model");

async function saveEvent(params, callback) {
    console.log("saveEvent: " + params);
    const eventingSchema = new eventing(params);
    eventingSchema.save()
    .then(async(response) => {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    });

}

async function getAllEventing(meetId, callback) {
    eventing.find({meetingId: meetId})
    .then((response) => {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    })
}

module.exports = {
    saveEvent,
    getAllEventing
}