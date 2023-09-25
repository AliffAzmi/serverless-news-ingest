const mongoose = require('mongoose')

const conn = require('../dbToken')

const TokenSchema = new mongoose.Schema({
    token : String,
    name: String
});

module.exports = conn.model('token', TokenSchema)