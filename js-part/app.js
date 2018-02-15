const { spawnSync } = require('child_process');
const { URL } = require('url');
const os = require('os');
const querystring = require('querystring');
const http = require('https');
const apiconf = require('./rest-api-config.json');

function getTemp() {
    let obj = JSON.parse(spawnSync('./helper/IoT-temp.exe').stdout.toString());
    let res = {};
    if (obj['Error'] === undefined && obj.temperature !== undefined) {
        res.temperature = obj.temperature;
    } else {
        res.temperature = -1;
        res.err = obj['Error'];
    }
    return res;
}

function getSystemInfo() {
    let res = [];
    res.temperature = getTemp().temperature;
    res.ram_free = os.freemem();/*scaleBytes(os.freemem());*/
    res.ram_usage = 100 * (os.totalmem() - res.ram_free) / os.totalmem();
    res.ram_free /= Math.pow(1024, 2);
    return res;
}

function scaleBytes(bytes) {
    let res;
    if (bytes % Math.pow(1024, 3) > 0) {
        res = `${(bytes / Math.pow(1024, 3)).toFixed(2)} GB`;
    } else if (bytes % Math.pow(1024, 2) > 0) {
        res = `${(bytes / Math.pow(1024, 2)).toFixed(2)} MB`;
    } else if (bytes % 1024 > 0) {
        res = `${(bytes / 1024).toFixed(2)} KB`;
    } else {
        res = `${bytes} bytes`;
    }
    return res;
}


function PostData() {
    // Build the post string from an object
    let arrReqs = [];
    let sysinfo = getSystemInfo();
    arrReqs.push(genReqUbidots(sysinfo));
    arrReqs.push(genReqThingsspeak(sysinfo));
    //Buffer.byteLength(post_data);
    arrReqs.forEach((req) => {
        let request = http.request(req.req_options, function (res) {
            // res.setEncoding('utf8');
            // res.on('data', function (chunk) {
            //     console.log('Response: ' + chunk);
            // });
        });
        if (request.method === 'POST') {
            request.write(req.req_data);
        }
        request.on('error', (err) => {
            console.log(err);
        });
        request.end();
    });
}

function genReqThingsspeak(sysinfo) {
    let req_options = apiconf.thingsspeak.req_options;
    req_options.path = `${req_options.path}?${querystring.stringify({
        api_key: apiconf.thingsspeak.api_key,
        field1: sysinfo.ram_usage,
        field2: sysinfo.ram_free,
        field3: sysinfo.temperature
    })}`;
    return {
        req_options: new URL('https:' + req_options.host + req_options.path),
        req_data: ''
    };
}

function genReqUbidots(sysinfo) {
    let req_data = {};
    let req_options = apiconf.ubidots.req_options;

    for (let [key, value] of entries(apiconf.ubidots.vars)) {
        req_data[value] = sysinfo[key];
    }

    req_data = JSON.stringify(req_data);

    req_options.headers['Content-Length'] = Buffer.byteLength(req_data);
    return {
        req_options: req_options,
        req_data: req_data
    };
}


function* entries(obj) {
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}

setInterval(function () { PostData(); }, 5000);