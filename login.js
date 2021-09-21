const fs = require('fs');
const crypto = require('crypto');
const md5 = require('./cryptos/md5');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const info = require('./cryptos/info');
const { spawnSync } = require('child_process');
const { exit } = require('process');

const [username, password] = process.argv;

// 校园网的地址必定是 10. 开头的
const ip = spawnSync("ip addr | grep -o 'inet 10.[^/]*' | grep -o '[0-9.]*'");

const callback = "jQuery112406199704547613489_";


function sha1(data) {
	return crypto
	.createHash('sha1')
	.update(data, "binary")
	.digest("hex");
}

async function login(){
    var challenge = undefined;
    return new Promise(resolve=>{
        fetch("http://10.248.98.2/cgi-bin/get_challenge?callback="+callback+Date.parse(new Date())+"&username="+username+"&ip="+ip+"&_="+Date.parse(new Date()), {
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
        }).then(res=>{
            return res.text();
        }).then(text=>{
            challenge = text.match(/:".*?",/g)[0];
            challenge = challenge.substr(2);
            challenge = challenge.substr(0,challenge.length-2);
			
			var i = info({
				username: username,
				password: password,
				ip: ip,
				acid: '1',
				enc_ver: 'srun_bx1'
			}, challenge);

			var hmd5 = md5(password,challenge);

			var chksum = challenge + username;
			chksum += challenge + hmd5;
			chksum += challenge + '1';
			chksum += challenge + ip;
			chksum += challenge + '200';
			chksum += challenge + '1';
			chksum += challenge + i;

			chksum = sha1(chksum);
			i = encodeURIComponent(i);
			hmd5 = encodeURIComponent('{MD5}'+hmd5);

			fetch("http://10.248.98.2/cgi-bin/srun_portal?callback="+callback+Date.parse(new Date())+"&action=login&username="+username+"&password="+hmd5+"&ac_id=1&ip="+ip+"&chksum="+chksum+"&info="+i+"&n=200&type=1&os=Windows+10&name=Windows&double_stack=0&_=" + Date.parse(new Date()), {
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
			}).then(res=>{
				if(res.ok) exit(0);
				else exit(1);
			});
        });
    });
}
login();

