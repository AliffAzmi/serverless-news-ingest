const axios = require('axios')

require('dotenv').config()

const REUTERS_INTENT_URI = process.env.REUTERS_INTENT_URI

const getChannels = token => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        params: {
          token: token,
          channelCategory: 'olr' // top 10 reuters online channels
        }
      }
      var channels = await axios.get(`${REUTERS_INTENT_URI}/channels`, params)
      if (channels.data) {
        var payload = []
        channels.data.channelInformation.map(item => {
          var obj = {}
          obj.channelName = item.description
          obj.channelAlias = item.alias
          obj.channelLastUpdate = item.lastUpdate
          payload.push(obj)
        })
        resolve(payload)
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getChannels
