const axios = require('axios')

require('dotenv').config()

const Ingest = require('../models/Ingest')
const LastFetch = require('../models/LastFetch')

const REUTERS_INTENT_URI = process.env.REUTERS_INTENT_URI

const getPackages = (token, channels) => {
  return new Promise(async (resolve, reject) => {
    try {
      var reply = channels.map(async channel => {
        const params = {
          params: {
            token: token,
            channel: channel.channelAlias,
            fieldsRef: 'default',
            limit: 20
          }
        }
        var packages = await axios.get(`${REUTERS_INTENT_URI}/packages`, params)
        var payload = await beautifyPayload(token, channel, packages)
        await last_fetch()
        return payload
      })
      Promise.all(reply)
        .then(data => {
          resolve(data)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    } catch (error) {
      reject(error)
    }
  })
}

function last_fetch () {
  return new Promise((resolve, reject) => {
    var obj = {}
    LastFetch.findOneAndUpdate({ source: 'Reuters' }, obj, { upsert: true })
      .then(response => {
        resolve(response)
      })
      .catch(err => {
        console.log('err', err)
        reject(err)
      })
  })
}

async function beautifyPayload (token, channel, packages) {
  var replace = /VIEWIMAGE/gi
  var replaceSize = /:512X288/gi
  const updatePromises = packages.data.results.map(async item => {
    const date = new Date(item.dateCreated)

    // item.previewUrl ? item.previewUrl.replace(replaceSize, "") : ''

    var obj = {}
    obj.id = item.id
    obj.iid = item.guid
    obj.version = item.version
    obj.headline = item.headline
    obj.dateCreated = item.dateCreated
    obj.dateCreatedUnix = date.getTime()
    obj.language = item.language
    obj.channel = channel.channelName
    obj.channel_alias = channel.channelAlias
    obj.channelLastUpdate = channel.channelLastUpdate

    obj.imgPreviewUrl = ''
    if (item.previewUrl) {
      if (item.previewUrl.includes('512X288')) {
        obj.imgPreviewUrl = item.previewUrl ? item.previewUrl : ''
      } else {
        obj.imgPreviewUrl = item.previewUrl
          ? item.previewUrl.replace(replace, 'BASEIMAGE')
          : ''
      }
    }

    obj.assetFetch = false

    var txtMeta = await getTxtMeta(
      token,
      item.links.filter(c => c.mediaType === 'T')[0].id
    )
    var imgMeta =
      item.links.filter(c => c.mediaType === 'P')[0] &&
      (await getImgMeta(
        token,
        item.links.filter(c => c.mediaType === 'P')[0].id
      ))
    obj.byline = txtMeta.byline
    obj.caption = txtMeta.caption
    obj.source = txtMeta.credit
    obj.content = txtMeta.content
    obj.imgCaption = imgMeta ? imgMeta.imgCaption : ''

    console.log(
      `Upsert ${obj.id} channel ${obj.channel_alias} - with image ${obj.imgPreviewUrl}`
    )

    return Ingest.findOneAndUpdate({ id: item.id }, obj, { upsert: true })
  })
  const data = await Promise.all(updatePromises)
  return data
}

function getTxtMeta (token, id) {
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

function getImgMeta (token, id) {
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
      obj.imgCaption = item.data.caption ? item.data.caption : ''

      resolve(obj)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getPackages
