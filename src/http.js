const fs = require('fs');
const paths = require('./path');
const loggerLib = require('./logger');

var request = require('request'),
    http = require('follow-redirects').http,
    request = request.defaults({
        jar: true
    });

var failures = 0;


const cloudflareScraper = require('cloudflare-scraper');
const cloudscraper = require('cloudscraper');
//https://www.npmjs.com/package/cloudflare-scraper
var secondRequest = async () => {
    // try {
    //     const response = await cloudflareScraper.get('https://rocket-league.com/items/shop/');
    //     console.log(response);
    //     console.log("LOG")
    // } catch (error) {
    //     console.log(error);
    //     console.log("ERROR")
    // }

    var options = {
        method: 'GET',
        url: 'https://rocket-league.com/items/shop/',
    };
    cloudscraper(options)
        .then(function (htmlString) {
            console.log("Success")
        })
        .catch(function (err) {
            console.log(err)
        });
}

module.exports.request = (callback, urlParam = null) => {
    urlParam = urlParam || "";
    var str = '';

    var options = {
        hostname: paths.url,
        path: paths.urlPath + urlParam + '?' + new Date().getTime(),
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
            'Accept': '/',
            'Connection': 'keep-alive'
        }
    };

    secondRequest();
    http.request(options, function (resp) {
        resp.setEncoding('utf8');
        if (resp.statusCode) {
            if (resp.statusCode == 200) {
                failures = 0;
                resp.on('data', function (part) {
                    str += part;
                });
                resp.on('end', function (part) {
                    callback(str);
                });

                resp.on('error', function (e) {
                    loggerLib.error('Problem with request: ' + e.message, 'http.js', '0x8ce455')
                });
            } else {
                var delay = setInterval(() => {
                    if (failures >= 10) {
                        loggerLib.error('10 Failures. Aborting fetch with statusCode: ' + resp.statusCode, 'http.js', '0x6ec7a5');
                        failures = 0;
                        clearInterval(delay);
                        return;
                    }
                    failures++;
                    module.exports.request(callback)
                    clearInterval(delay);
                }, 10000);
            }
        }
    }).end(str);
}