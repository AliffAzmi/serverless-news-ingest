const axios = require('axios')

require('dotenv').config()

const Ingest = require('../models/Ingest')

const REUTERS_INTENT_URI = process.env.REUTERS_INTENT_URI

const getChannelItems = (token, channels) => {
  return new Promise(async (resolve, reject) => {
    try {
      channels.map(async channel => {
        const params = {
          params: {
            token: token,
            channel: channel.channelAlias,
            mediaType: 't',
            limit: 10
          }
        }
        var channelItems = await axios.get(
          `${REUTERS_INTENT_URI}/items`,
          params
        )
        var payload = await beautifyPayload(token, channel, channelItems)
        console.log(payload)
        resolve('OK')
      })
    } catch (error) {
      reject(error)
    }
  })
}

function beautifyPayload (token, channel, channelItems) {
  return new Promise((resolve, reject) => {
    // var data = []
    channelItems.data.results.map(async item => {
      var obj = {}
      obj.id = item.id
      obj.headline = item.headline
      obj.dateCreated = item.dateCreated
      obj.source = item.source
      obj.language = item.language
      obj.channel = channel.channelName
      obj.alias = channel.channelAlias
      obj.channelLastUpdate = channel.channelLastUpdate

      var meta = await getMeta(token, item.id)
      obj.byline = meta.byline
      obj.caption = meta.caption
      obj.credit = meta.credit
      obj.content = meta.content

      Ingest.findOneAndUpdate({ id: item.id }, obj, { upsert: true })
        .then(response => {
          resolve(response)
        })
        .catch(err => {
          console.log('err', err)
          reject(err)
        })
    })
  })
}

function getMeta (token, id) {
  return new Promise(async (resolve, reject) => {
    const params = {
      params: {
        token: token,
        id: id
      }
    }
    try {
      var item = await axios.get(`${REUTERS_INTENT_URI}/item`, params)

      var obj = {}
      obj.credit = item.data.credit ? item.data.credit : ''
      obj.byline = item.data.byline ? item.data.byline : ''
      obj.caption = item.data.caption ? item.data.caption : ''
      obj.content = item.data.body_xhtml

      resolve(obj)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getChannelItems
