const mongoose = require('mongoose')
require('dotenv').config()

var connection = mongoose.createConnection(process.env.MONGODB_ATLAS_CLUSTER_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
console.log(' exec '+ mongoose.connection.readyState)

module.exports = connection