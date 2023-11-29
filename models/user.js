const mongoose = require('mongoose');

const usersSchema = {
  username: String,
};

const Users = new mongoose.model('Users', usersSchema);

module.exports = Users;
