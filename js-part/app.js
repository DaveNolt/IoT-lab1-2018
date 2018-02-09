const { spawnSync } = require('child_process');
const os = require('os');
const querystring = require('querystring');
const http = require('http');


function getTemp() {
    let obj = JSON.parse(spawnSync('./helper/IoT-temp.exe').stdout.toString());
    let res = {};
    if (obj["Error"] === undefined && obj.temperature !== undefined) {
        res.temperature = obj.temperature;
    } else {
        res.temperature = -1;
        res.err = obj["Error"];
    }
    return res;
}

function getSystemInfo() {
    let res = [];
    res['5a60c981c03f976ffe0a284f'] = getTemp().temperature;
    res['5a60c98fc03f9770ac00c511'] = os.totalmem() / Math.pow(1024,2);/*scaleBytes(os.totalmem());*/
    res['5a7d18d0c03f971f7049b09f'] = os.freemem() / Math.pow(1024,2);/*scaleBytes(os.freemem());*/
    res['5a7d18f6c03f971f53609f8d'] = 100 * (res['5a60c98fc03f9770ac00c511'] - res['5a7d18d0c03f971f7049b09f']) / res['5a60c98fc03f9770ac00c511'];
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

// let test = getSystemInfo();
// test.totalMem = scaleBytes(test.totalMem);
// test.freeMem = scaleBytes(test.freeMem);
// test.memUsage = test.memUsage.toFixed(2) + '%';

function PostData(id, val) {
    // Build the post string from an object
    let post_data = JSON.stringify({value: val});
  
    // An object of options to indicate where to post to
    let post_options = {
        host: 'things.ubidots.com',
        path: '/api/v1.6/variables/' + id + '/values',
        method: 'POST',
        headers: {
            'Connection': 'close',
            'X-Auth-Token': 'A1E-chqg35bli7Ks7gPNiXkvHnwrELqNrk',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };
  
    // Set up the request
    let post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
  
    // post the data
    post_req.write(post_data);
    post_req.end();
  
  }

  setInterval(function() {
    let arr = getSystemInfo();
    for(let item in arr) {
        PostData(item, arr[item]);
    }
  }, 1000);