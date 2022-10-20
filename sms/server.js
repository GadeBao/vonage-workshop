'use strict';

const express = require('express');
const bodyParser = express.urlencoded({ extended: false });
const app = express();
app.use(express.json());

const {FROM_NUMBER} = process.env;
if (!FROM_NUMBER) {
    console.log( 'Please configure environment variables as described in README.md');
    throw new Error('Please configure environment variables as described in README.md');
}

const Nexmo = require('nexmo');
const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
});
const encode = {type: "unicode"};
const text = "👋 Hello from Vonage!";
const long_text = "※お得意様に特別なご案内です※\\n寶來　金太郎様、いつもお世話になっております。\\nﾛｰﾄﾞｽﾀｰ多摩 -303-に-6977の車検満了日がR 04/10/15に到来となります。\\n\\n早めのご予約がオススメです！\\n★速くて安い！お得な瑞穂店のご案内です★\\n指定工場のオートアロウ16号瑞穂店（速太郎16号瑞穂店）では、最速45分で車検完了！しかも簡単ネット予約は3,300円割引！\\n車検のご入庫は車検満了日の1カ月前から可能です。\\n\\n▼▼▼地域最安値にビックリ▼オートアロウ瑞穂店のネット予約はコチラから▼▼▼\\nhttps://nyuko-yoyaku.com/e7dc3a1de36ff8c896451487c3fea6e5/daily/?wid=370&sid=45-f\\n瑞穂店：0120-16-0039\\n\\n▼オートアロウあきる野店のご予約は▼▼▼\\nご予約はお電話のみとなります。\\nあきる野店・0120-57-8585";

app.get('/', (req, res) => {
  res.end('Hello from Vonage workshop!\n');
});

app.get('/sms/send', (req, res) => {
    nexmo.message.sendSms(process.env.FROM_NUMBER, process.env.TO_NUMBER, long_text, encode, (err, responseData) => {
        if (err) {
            console.log(err);
        } else {
            if (responseData.messages[0]['status'] === "0") {
                console.log("Message sent successfully.");
            } else {
                console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
        res.status(200).send('GET sms send called..\n');
    });
});

app.post('/sms/send', bodyParser, (req, res) => {
    console.log(req.body);
    const from = req.body.from || process.env.FROM_NUMBER;
    const to = req.body.to || process.env.TO_NUMBER;
    const body = req.body.text || text;

    if (!to) {
        res.status(400).send('Please provide LVN number in the "to" request body parameter.');
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

const dlrHandler = (req, res) => {
    console.log(req.body);
    res.status(204).send();
};
app.route('/sms/dlr')
.get(dlrHandler)
.post(dlrHandler);

app.post('/sms/receive', (req, res) => {
    console.log(req.body);
    res.status(200).end();
});

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
}
exports.app = app;