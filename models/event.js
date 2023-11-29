const mongoose = require("mongoose");

const eventSchema = {
    topic: String,
    eventTitle: String,
    eventBody: String,
    bookings: [{
        userName: String,
        phoneNumber: String,
        email: String,
    }]
};

const Event = new mongoose.model("Event", eventSchema);

module.exports = Event;
