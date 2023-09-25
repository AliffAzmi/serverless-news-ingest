const axios = require('axios')

require('dotenv').config()

const Token = require('../models/Token')

const REUTERS_LOGIN_URI = process.env.REUTERS_LOGIN_URI
const REUTERS_INTENT_URI = process.env.REUTERS_INTENT_URI
const REUTERS_WSA_USERNAME = process.env.REUTERS_WSA_USERNAME
const REUTERS_WSA_PASSWORD = process.env.REUTERS_WSA_PASSWORD

const getToken = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var token = await checkToken('reuters')
      var valid = await validateToken(token)

      if (valid) {
        console.log('TOKEN VALID. CONTINUE....')
        resolve(token[0].token)
      } else {
        console.log('TOKEN NOT VALID. INVOKING....')
        axios
          .post(
            `${REUTERS_LOGIN_URI}?username=${REUTERS_WSA_USERNAME}&password=${REUTERS_WSA_PASSWORD}`
          )
          .then(response => {
            token = response.data.authToken.authToken
            storeToken(token, 'reuters')
            resolve(token)
          })
          .catch(e => {
            console.log(e.response)
            reject(e.response)
          })
      }
    } catch (error) {
      reject(error)
    }
  })
}

function validateToken (token) {
  const params = {
    params: {
      token: token[0].token,
      channelCategory: 'olr' // top 10 reuters online channels
    }
  }
  return new Promise(async resolve => {
    try {
      var chn = await axios.get(`${REUTERS_INTENT_URI}/channels`, params)
      resolve(true)
    } catch (error) {
      resolve(false)
    }
  })
}

function checkToken (name) {
  return new Promise((resolve, reject) => {
    Token.find({ name: name })
      .then(token => resolve(token))
      .catch(err => reject(err))
  })
}

function storeToken (token, name) {
  return new Promise((resolve, reject) => {
    Token.findOneAndUpdate(
      { name: name },
      { token: token, name: name },
      { upsert: true }
    )
      .then(token => resolve(token))
      .catch(err => reject(err))
  })
}

module.exports = getToken
