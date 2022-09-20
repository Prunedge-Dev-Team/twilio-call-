'use strict';

require('dotenv').config()
const http = require('http');
const express = require('express');
const {urlencoded} = require('body-parser');
const twilio = require('twilio');

const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;

let app = express();
app.use(express.static(__dirname + '/public'));
app.use(urlencoded({ extended: false }));

// Generate a Twilio Client capability token
app.get('/token', (req, res) => {
  const capability = new ClientCapability({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  });

  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: process.env.TWILIO_TWIML_APP_SID
    })
  );

  const token = capability.toJwt();

  res.send({
    token: token
  });
});

// Create TwiML for outbound calls
app.post('/voice', (req, res) => {
  let voiceResponse = new VoiceResponse();
  voiceResponse.dial({
    callerId: process.env.TWILIO_NUMBER,
  }, req.body.number);
  res.type('text/xml');
  res.send(voiceResponse.toString());
})

app.use((error, req, res, next) => {
  res.status(500);
  res.send('Server Error');
  console.error(error.stack);
  next(error);
})

let server = http.createServer(app);
let port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Express Server listening on *:${port}`)
})

module.exports = app;
