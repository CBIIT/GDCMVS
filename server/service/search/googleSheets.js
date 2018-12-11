const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const logger = require('../../components/logger');

var manageSheets = function (req, res) {
    // const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
    const TOKEN_PATH = 'token.json';
    const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
    const PRIVATE_KEY_PATH = 'privatekey.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);

        // authorizeOAuth2(JSON.parse(content), TOKEN_PATH, SCOPES, listMajors);
    });
    authorize(PRIVATE_KEY_PATH, SCOPES, listMajors);
    res.send("Success");
}

function listMajors(auth) {
    read_data(auth);
    // append_data(auth);
    // update_data(auth);
}

function authorize(TOKEN_PATH, SCOPES, callback) {
    fs.readFile(TOKEN_PATH, (err, privatekey) => {
        if (err) return console.log(err);
        let jwtClient = new google.auth.JWT(JSON.parse(privatekey).client_email, null, JSON.parse(privatekey).private_key, SCOPES);
        jwtClient.authorize(function(err, token){
            if(err) return console.log(err);
        });
        callback(jwtClient);
    });
}
function authorizeOAuth2(credentials, TOKEN_PATH, SCOPES, callback){    
    const {
        client_secret,
        client_id,
        redirect_uris
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, TOKEN_PATH, SCOPES, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

function getNewToken(oAuth2Client, TOKEN_PATH, SCOPES, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
    logger.debug('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return logger.debug('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) logger.debug(err);
                logger.debug('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function read_data(auth) {
    google.sheets('v4').spreadsheets.values.get({
        spreadsheetId: '1pv8fJLb-diiA6EHFAX_h97OaN87Is7nZANi2QaUOp0o',
        range: 'Sheet1',
        auth: auth
    }, (err, data) => {
        if (err) return logger.debug('The API returned an error: ' + err);
        console.log(data);
    });
}

function append_data(auth) {
    google.sheets('v4').spreadsheets.values.append({
        auth: auth,
        spreadsheetId: '1pAj3-QcOpFWlqbhAChiS4n64FWbwuPyfH72v1ot2ORg',
        range: 'Sheet1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: [
                ["Clinical", "Diagnosis", "Morphology", "8000/3"]
            ],
        },
    }, (err, data) => {
        if (err) return logger.debug('API is not working: ' + err);
        console.log(data);
    });
}

function update_data(auth) {
    var arr = [
        ["Clinical", "Diagnosis", "Morphology", "d"],
        ["Clinical", "Diagnosis", "c", "8000/1"],
        ["a", "Diagnosis", "Morphology", "8000/2"],
        ["Clinical", "b", "Morphology", "8000/3"]
    ];
    google.sheets('v4').spreadsheets.values.update({
        auth: auth,
        spreadsheetId: '1pAj3-QcOpFWlqbhAChiS4n64FWbwuPyfH72v1ot2ORg',
        range: 'Sheet1!A2',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: arr,
        },
    }, (err, data) => {
        if (err) return logger.debug('API is not working: ' + err);
        console.log(data);
    })
}

module.exports = {
    manageSheets
}