const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventing = mongoose.model(
    "Eventing",
    mongoose.Schema({
        meetingId: {
            type: String,
            require: true
        },
        dateTime: {
            type: String,
            require: false
        },
        name: {
            type: String,
            require: false
        },
        purpose: {
            type: String,
            require: false
        },
        code: {
            type: String,
            require: false
        }

    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id.toString(),
                delete ret._id;
                delete ret._v;
            }
        }
    },
    {timestamps: true}
    )
);

module.exports = {
    eventing
}