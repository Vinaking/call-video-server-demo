const meetingServices = require("../services/meeting.service");

exports.startMeeting = (req, res, next) => {
    console.log("hostId: "+ req.body.hostId)
    console.log("res: "+ res.body)
    const {hostId, hostName} = req.body;

    var model = {
        hostId: hostId,
        hostName: hostName,
        startTime: Date.now()
    }

    console.log("model: "+ model.hostId)

    meetingServices.startMeeting(model, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results.id,
        });
    })
}

exports.checkMeetingExists = (req, res, next) => {
    const{meetingId} = req.query;

    console.log('join-meetingid: '+ meetingId);

    meetingServices.checkMeetingExists(meetingId, (error, results) => {
        if(error) {
            console.log('join-meetingid: error' + error);
            return next(error);
        }

        console.log('join-meetingid: success');
        return res.status(200).send({
            message: "Success",
            data: results
        });
    })
}

exports.getAllMeetingUsers = (req, res, next) => {
    const {meetingId} = req.query;

    meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        });
    })
}