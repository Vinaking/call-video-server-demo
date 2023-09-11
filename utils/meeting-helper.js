const meetingServices = require("../services/meeting.service");
const {MeetingPayloadEnum} = require("./meeting-payload.num");

async function joinMeeting(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: joinMeeting: meetingId: "+ meetingId);
    const {userId, name} = payload.data;

    console.log("meeting-helper: joinMeeting: userId: "+ userId);

    meetingServices.isMeetingPresent(meetingId, async(error, results) => {
        if(error && !results) {
            sendMessage(socket, {
                type: MeetingPayloadEnum.NOT_FOUND
            });
        }

        if(results) {
            addUser(socket, {meetingId, userId, name}).then((results) => {
                if(results) {
                    sendMessage(socket, {
                        type: MeetingPayloadEnum.JOINED_MEETING,
                        data: {
                            userId
                        }
                    });

                    broadcastUsers(meetingId, socket, meetingServer, {
                        type: MeetingPayloadEnum.USER_JOINED,
                        data: {
                            userId, 
                            name,
                            ...payload.data
                        }
                    });
                }
            }, (error) => {
                console.log(error);
            });
        }
    });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
    const {userId, otherUserId, name} = payload.data;

    console.log("meeting-helper: forwardConnectionRequest: payload: "+ userId + " " + otherUserId + " " + name );
    
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    }

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.CONNECTION_REQUEST,
                data: {
                    userId,
                    name, 
                    ...payload.data
                }
            });

            console.log("meeting-helper: connection-request: "+ payload.data);
            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
        
    });
}

function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: forwardIceCandidate: meetingId: "+ meetingId);
    const {userId, otherUserId, candidate} = payload.data;
    
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    }

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ICECANDIDATE,
                data: {
                    userId,
                    candidate
                }
            });
            console.log("meeting-helper: forwardIceCandidate: socket send: "+ meetingId + " socketid: " + results.socketId);
            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    });
}

function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: forwardOfferSDP: meetingId: "+ meetingId);
    const {userId, otherUserId, sdp} = payload.data;
    
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    }

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.OFFER_SDP,
                data: {
                    userId,
                    sdp
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    });
}

function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: forwardAnswerSDP: meetingId: "+ meetingId);
    const {userId, otherUserId, sdp} = payload.data;
    
    var model = {
        meetingId: meetingId,
        userId: otherUserId
    }

    meetingServices.getMeetingUser(model, (error, results) => {
        if(results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ANSWER_SDP,
                data: {
                    userId,
                    sdp
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    });
}

function userLeft(meetingId, socket, meetingServer, payload) {
    const {userId} = payload.data;
    console.log("meeting-helper: userLeft: userId: "+ userId);
    
    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.USER_LEFT,
        data: {
            userId: userId
        }
    });
}

function endMeeting(meetingId, socket, meetingServer, payload) {
    const {userId} = payload.data;
    
    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.MEETING_END,
        data: {
            userId: userId
        }
    });

    meetingServices.getAllMeetingUsers(meetingId, (error, results) => {
        let usersStr = ""+results;
        let users = Array.from(usersStr)
        console.log("meeting-helper: getAllMeetingUsers aa: "+ users.length);
        for (let i = 0; i < users.length; i++) {
            const meetingUser = users[i];

            // meetingServer.socket.connect(meetingUser.socketId).disconect();
        }
    })
}

function forwardEvent(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: forwardEvent: meetingId: "+ meetingId);
    const {userId} = payload.data;
    
    broadcastUsers(meetingId, socket, meetingServer, {
        type: payload.type,
        data: {
            userId: userId,
            ...payload.data
        }
    });

}

function addUser(socket, {meetingId, userId, name}) {
    console.log("meeting-helper: addUser: meetingId: "+ meetingId);
    let promise = new Promise( function (resolve, reject) {
        meetingServices.getMeetingUser({meetingId, userId}, (error, results) => {
            if(!results) {
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true
                };

                meetingServices.joinMeeting(model, (error, results) => {
                    if(results) {
                        resolve(true);
                    }
                    if(error) {
                        reject(error);
                    }
                })
            } else {
                meetingServices.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id
                }, (error, results) => {
                    if(results) {
                        resolve(results);
                    } 
                    if(error) {
                        reject(error);
                    }
                })
            }
        })
    });
    
    return promise;
}

function sendMessage(socket, payload) {
    console.log("meeting-helper: sendMessage: payloadtype: "+ payload.type);

    socket.send(JSON.stringify(payload));
}

function broadcastUsers(meetingId, socket, meetingServer, payload) {
    console.log("meeting-helper: payload: "+ payload.type + " userid: "+ payload.data.userId);
    socket.broadcast.emit("message", JSON.stringify(payload))
}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    forwardEvent,
    addUser,
    sendMessage,
    broadcastUsers
}