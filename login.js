import crypto from 'crypto';
import md5 from './cryptos/md5.cjs';
import info from './cryptos/info.cjs';
import fetch from 'node-fetch';
import inspector from 'node:inspector';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import { networkInterfaces } from 'os';

const debug = inspector.url() !== undefined;

if (debug) {
    var st, et;
}

const getIp = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal && net.address.startsWith('10.')) {
        return net.address;
      }
    }
  }
}

// 忽略前两个参数, argv 是一个类似 ['node', 'login.js', 'xxx', 'xxx'] 的数组
const [, , username, password] = process.argv;
const ip = getIp();
console.log(ip);

const callback = "jQuery112406199704547613489_";

function sha1(data) {
  return crypto
    .createHash('sha1')
    .update(data, "binary")
    .digest("hex");
}

async function test_connectivity() {
  if (debug) {
    st = performance.now();
  }
  const testRes = await pTimeout(fetch("http://connectivitycheck.platform.hicloud.com/generate_204", {
    "body": null,
    "method": "GET"
  }), 1000);
  if (debug) {
    et = performance.now();
    console.log('test_connectivity time:', et - st);
  }
  if (!testRes || !testRes.ok) throw new Error(result.statusText);
  if (debug) {
    console.log("testRes status:", testRes.status);
  }
  if (testRes.status !== 204) {
    throw new Error('No connection.');
  }
}

async function login() {
  if (debug) {
    st = performance.now();
  }
  const response = await pTimeout(fetch("http://10.248.98.2/cgi-bin/get_challenge?callback=" + callback + Date.parse(new Date()) + "&username=" + username + "&ip=" + ip + "&_=" + Date.parse(new Date()), {
    "headers": {
      "accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
      "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
      "proxy-connection": "keep-alive",
      "x-requested-with": "XMLHttpRequest",
    },
    "referrer": "http://10.248.98.2/srun_portal_pc?ac_id=1&theme=basic2",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
  }), 800);
  if (debug) {
    et = performance.now();
    console.log('get_challenge time:', et - st);
    console.log('get_challenge response:', response);
  }
  if (!response || !response.ok) throw new Error(response.statusText);
  const responseBody = await response.text();
  const matches = responseBody.match(/"challenge":"(.*?)",/);
  if (!matches || matches.length < 2) throw new Error(`Challenge not found in '${responseBody}'.`);
  const challenge = matches[1];

  var i = info({
    username: username,
    password: password,
    ip: ip,
    acid: '1',
    enc_ver: 'srun_bx1'
  }, challenge);

  var hmd5 = md5(password, challenge);

  var chksum = challenge + username;
  chksum += challenge + hmd5;
  chksum += challenge + '1';
  chksum += challenge + ip;
  chksum += challenge + '200';
  chksum += challenge + '1';
  chksum += challenge + i;

  chksum = sha1(chksum);
  i = encodeURIComponent(i);
  hmd5 = encodeURIComponent('{MD5}' + hmd5);

  if (debug) {
    st = performance.now();
  }
  const result = await pTimeout(fetch("http://10.248.98.2/cgi-bin/srun_portal?callback=" + callback + Date.parse(new Date()) + "&action=login&username=" + username + "&password=" + hmd5 + "&ac_id=1&ip=" + ip + "&chksum=" + chksum + "&info=" + i + "&n=200&type=1&os=Windows+10&name=Windows&double_stack=0&_=" + Date.parse(new Date()), {
    "headers": {
      "accept": "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01",
      "accept-language": "en,zh-CN;q=0.9,zh;q=0.8",
      "proxy-connection": "keep-alive",
      "x-requested-with": "XMLHttpRequest",
    },
    "referrer": "http://10.248.98.2/srun_portal_pc?ac_id=1&theme=basic2",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
  }), 800);
  if (debug) {
    et = performance.now();
    console.log('login time:', et - st);
    console.log('login response:', result);
  }
  if (!result || !result.ok) throw new Error(result.statusText);

  await test_connectivity();
}

if (debug) {
  await test_connectivity().catch(err => console.log(err));
  await login().catch(err => console.log(err));
} else {
  try {
    await test_connectivity();
  } catch {
    await pRetry(login, {
      onFailedAttempt: err => {
        console.log(`Attempt ${err.attemptNumber} failed. There are ${err.retriesLeft} retries left.`);
      },
      retries: 14
    });
  }
}