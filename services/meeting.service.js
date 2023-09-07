const { response } = require("express");
const {meeting} = require("../models/meeting.model");
const {meetingUser} = require("../models/meeting.user");

async function getAllMeetingUsers(meetId, callback) {
    meetingUser.find({meetingId: meetId})
    .then((response) => {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    })
}

async function startMeeting(params, callback) {
    console.log(params)
    const meetingSchema = new meeting(params);
    meetingSchema.save()
    .then(async(response) => {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    });
}

async function joinMeeting(params, callback) {
    const meetingUserModel = new meetingUser(params);

    meetingUserModel.save()
    .then(async(response) => {
        meeting.findOneAndUpdate({id: params.meetingId}, {$addToSet: {"meetingUser": meetingUserModel}})
        return callback(null, response);
    })
    .catch((error) => {
        callback(error);
    });
}

async function isMeetingPresent(meetingId, callback) {
    meeting.findById(meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then((response) => {
        if(!response) callback("Invalid Meeting Id");
        else callback(null, true);
    })
    .catch((error) => {
        return callback(error, false)
    })
}

async function checkMeetingExists(meetingId, callback) {
    meeting.findById(meetingId, "hostId, hostName, startTime")
    .populate("meetingUsers", "MeetingUser")
    .then((response) => {
        if(!response) callback("Invalid Meeting Id");
        else callback(null, response);
    })
    .catch((error) => {
        return callback(error, false)
    })
}

async function getMeetingUser(params, callback) {
    const {meetingId, userId} = params;

    meetingUser.find({meetingId, userId})
    .then((response) => {
        return callback(null, response[0])
    })
    .catch((error) => {
        return callback(error)
    });
}

async function updateMeetingUser(params, callback) {
    meetingUser.updateOne({userId: params.userId}, {$set: params}, {new: true})
    .then((response)=> {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    })
}

async function getUserBySocketId(params, callback) {
    const{meetingId, socketId} = params;

    meetingUser.find({meetingId, socketId})
    .limit(1)
    .then((response) => {
        return callback(null, response);
    })
    .catch((error) => {
        return callback(error);
    })
}

module.exports = {
    getAllMeetingUsers,
    startMeeting,
    joinMeeting,
    isMeetingPresent,
    checkMeetingExists,
    getMeetingUser,
    updateMeetingUser,
    getUserBySocketId
}