const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
    verifiers: [
        {
            id: 0,
            code: 0,
        },
    ],
    authors: [
        {
            id: 0,
            name: "Billy"
        }
    ]
}).write();

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const {FROM_NUMBER} = process.env;
if (!FROM_NUMBER) {
    console.log( 'Please configure environment variables as described in README.md');
    throw new Error('Please configure environment variables as described in README.md');
}

const Nexmo = require("nexmo");
const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET
});

function add(request_id, code) {
    db.get('verifies')
    .push({ time: Date.now(), id: request_id, cd: code })
    .write();
};
  
function reset() {
    db.set('items', [])
    .write()
}
  
app.get('/verify', (req, res) => {
    nexmo.verify.request({
        number: process.env.TO_NUMBER,
        brand: process.env.BRAND_NAME
    }, (err,result) => {
        if (err) {
            console.error(err);
        } else {
            const verifyRequestId = result.request_id;
            console.log('request_id', verifyRequestId);
        }
    });
    res.send('Get Verify called..');
});

app.post('/verifycheck', bodyParser, (req, res) => {
    const request_id = req.body.request_id || process.env.REQUEST_ID;
    const code = req.body.code || process.env.CODE;

    if (!request_id | !code) {
        res.status(400).send('Please provide "request_id" and "code" to request body parameter.');
        return;
    }

    nexmo.verify.check({
        request_id: request_id,
        code: code
    }, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.log(result)
        }
    });
});

app.get('/', function(req, res) {
    var mascots = [
        { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
        { name: 'Tux', organization: "Linux", birth_year: 1996},
        { name: 'Moby Dock', organization: "Docker", birth_year: 2013}];
    
    var tagline = "No programming concept is complete without a cute animal mascot.";
    
    res.render('../views/partials/index', {
        mascots: mascots,
        tagline: tagline
    });
});

app.get('/submit', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/form.html'));
  });

app.post('/submit', (req, res) => {
    console.log({
      name: req.body.name,
      message: req.body.message
    });
    res.send('Thanks for your message!');
  });

if (module === require.main) {
    const PORT = parseInt(process.env.PORT) || 8080;
    app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
      console.log('Press Ctrl+C to quit.');
    });
}
exports.app = app;
