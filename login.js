import crypto from 'crypto';
import md5 from './cryptos/md5.cjs';
import info from './cryptos/info.cjs';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import pRetry from 'p-retry';
import pTimeout from 'p-timeout';
import dns from 'dns';

// 忽略前两个参数, argv 是一个类似 ['node', 'login.js', 'xxx', 'xxx'] 的数组
const [, , username, password] = process.argv;

// 校园网的地址必定是 10. 开头的
// exec 的返回值是 Buffer 或者是 String, 二者都可以 toString, trim 以去掉最后的回车
const ip = execSync("ip addr | grep -o 'inet 10.[^/]*' | grep -o '[0-9.]*'").toString().trim();
// macOS 用户用这个：
// const ip = execSync('ifconfig getifaddr en0').toString().trim();

const callback = "jQuery112406199704547613489_";

function sha1(data) {
  return crypto
    .createHash('sha1')
    .update(data, "binary")
    .digest("hex");
}

async function login() {
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
  }), 1000);
  // (console.log(response);
  if (!response.ok) throw new Error(response.statusText);
  const challenge = (await response.text()).match(/"challenge":"(.*?)",/)[1];

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
  }).catch(err => {
    throw new Error(err.toString());
  }), 2000);
  // console.log(result);
  if (!result.ok) throw new Error(result.statusText);
  
  const testRes = await fetch('http://baidu.com');
  const testBody = await testRes.text();
  // console.log(testBody);
  if (!testRes.ok || !testBody.startsWith('<html>')) {
    throw new Error('No connection.');
  }
}

pRetry(login, {
  onFailedAttempt: error => {
    console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
  },
  retries: 60
});
