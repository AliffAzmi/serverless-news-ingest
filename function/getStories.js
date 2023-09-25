const axios = require('axios')

require('dotenv').config()

const Ingest = require('../models/Ingest')

const getStories = event => {
  return new Promise(async (resolve, reject) => {
    try {
      var projection = {}
      projection._id = 0
      projection.__v = 0
      event.queryStringParameters ? '' : (projection.content = 0)

      var limit = 30

      Ingest.find(event.queryStringParameters)
        .select(projection)
        .sort('-dateCreated')
        .limit(limit)
        .then(ingests => resolve(ingests))
        .catch(err => reject(err))
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getStories
