'use strict';

const express = require('express');
const bodyParser = express.urlencoded({ extended: false });
const app = express();
app.use(express.json());

const {VIRTUAL_NUMBER} = process.env;
if (!VIRTUAL_NUMBER) {
    console.log( 'Please configure environment variables as described in README.md');
    throw new Error('Please configure environment variables as described in README.md');
}

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  applicationId: process.env.APPLICATION_ID,
  privateKey: process.env.PRIVATE_KEY_PATH
});

const TTS = "重故障発生重故障発生　NTTアノードエナジー蓄電池システム重故障発生　ご対応ください.";
const TTS_ADD = "重故障発生　重故障発生";
const TTS_MIX = "You have one triggered incident on Service 1. The failure is: 重故障発生　重故障発生";
app.get('/voice/call', (req, res) => {
    nexmo.calls.create({
        to: [{
            type: 'phone',
            number: process.env.TO_NUMBER
        }],
        from: {
            type: 'phone',
            number: process.env.VIRTUAL_NUMBER
        },
        ncco: [{
            "action": "talk",
            "language": "ja-JP",
            "style": 5,
            "text": TTS_MIX
        }]
      });
      res.status(200).send('GET voice called again ..\n');
});

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
}
exports.app = app;