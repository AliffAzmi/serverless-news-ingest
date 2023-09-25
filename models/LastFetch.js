const mongoose = require('mongoose');
const conn = require('../dbLastFetch')

const LastFetchSchema = new mongoose.Schema({
    source : String,
}, { timestamps: true });

module.exports = conn.model('last_fetches', LastFetchSchema);