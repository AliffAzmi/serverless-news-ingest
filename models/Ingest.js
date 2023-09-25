const mongoose = require('mongoose');
const conn = require('../dbIngest')

const IngestSchema = new mongoose.Schema({
    id : { type : String, required : true },
    imgPreviewUrl : String
}, {strict: false});

module.exports = conn.model('ingests', IngestSchema);