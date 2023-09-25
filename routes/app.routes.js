const meetingController = require("../controllers/meeting.controller");
const eventingController = require("../controllers/eventing.controller");

const express = require("express");
const router = express.Router();

router.post("/meeting/start", meetingController.startMeeting);
router.get("/meeting/join", meetingController.checkMeetingExists);

router.get("/meeting/get", meetingController.getAllMeetingUsers);

router.post("/eventing/saveEvent", eventingController.saveEvent);
router.get("/eventing/getAllEvents", eventingController.getAllEventings);

module.exports = router;