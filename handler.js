'use strict'

require('dotenv').config()

const { getToken, getChannels, getChannelItems, getPackages, getStories } = require('./function/')

module.exports.ingest = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var token = await getToken()
  console.log('TOKEN ACQUIRED. Process channels....')
  var channels = await getChannels(token)
  console.log('DONE PROCESS', channels)
  var packages = await getPackages(token, channels)

  const response = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true
    },
      body: JSON.stringify(packages),
  };
  return response

};

module.exports.extend = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  var stories = await getStories(event)

  const response = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*",
        "Access-Control-Allow-Credentials" : true
    },
      body: JSON.stringify(stories),
  };
  return response

};