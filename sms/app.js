'use strict';

const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const {FROM_NUMBER} = process.env;
if (!FROM_NUMBER) {
  console.log(
    'Please configure environment variables as described in README.md'
  );
  throw new Error(
    'Please configure environment variables as described in README.md'
  );
}

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
});
const encode = {type: "unicode"};
const text = "👋 Hello from Vonage!";

app.get('/', (req, res) => {
  res.end('Hello from Vonage workshop!\n');
});

app.get('/sms/send', (req, res) => {
    nexmo.message.sendSms(process.env.FROM_NUMBER, process.env.TO_NUMBER, text, encode, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
        res.status(200).send('GET sms send called..');
    });
});

app.post('/sms/send', (req, res) => {
    const from = req.body.from || process.env.FROM_NUMBER;
    const to = req.body.to || process.env.TO_NUMBER;
    const body = req.body.text || text;

    if (!to) {
        res.status(400).send('Please provide an number in the "to" query string parameter.');
        return;
    }

    nexmo.message.sendSms(from, to, body, encode, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
        res.status(200).send('POST sms send called..\n');
    });
});

app.route('/sms/dlr')
.get(dlrHandler)
.post(dlrHandler);

function dlrHandler(req, res) {
    console.log(req.body);
    res.status(204).send();
}

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
}
exports.app = app;