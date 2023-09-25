const eventingService = require("../services/eventing.service");

exports.saveEvent = (req, res, next) => {
    // console.log("saveEvent: "+ req.body)
    const {meetingId, name, purpose, code} = req.body;

    var model = {
        meetingId: meetingId,
        name: name,
        purpose: purpose,
        code: code,
        dateTime: Date.now(),
    }

    console.log("model: "+ model.hostId)

    eventingService.saveEvent(model, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results.id,
        });
    })
}

exports.getAllEventings = (req, res, next) => {
    const {meetingId} = req.query;

    eventingService.getAllEventing(meetingId, (error, results) => {
        if(error) {
            return next(error);
        }
        return res.status(200).send({
            message: "Success",
            data: results
        });
    })
}