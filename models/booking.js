const mongoose = require("mongoose");

const bookingSchema = {
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    userName: String,
    phoneNumber: String,
    email: String,
};

const Booking = new mongoose.model("Booking", bookingSchema);

module.exports = Booking;
