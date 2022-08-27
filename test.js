const express = require('express'); //web服务框架模块
const request = require('request'); //http请求模块

const app = express();
const fs = require('fs'); //文件系统模块
const path = require('path'); //文件路径模块
const sha1 = require('node-sha1'); //加密模块
const urlencode = require('urlencode'); //URL编译模块

/**
 * [设置验证微信接口配置参数]
 */
const config = {
	token: 'abaaa', //对应测试号接口配置信息里填的token
	appid: 'wxab74eeba98aebdf0', //对应测试号信息里的appID
	secret: '96630d8c47fe03b96902c5522893304f', //对应测试号信息里的appsecret
	grant_type: 'client_credential' //默认
};

/**
 * [开启跨域便于接口访问]
 */
app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*'); //访问控制允许来源：所有
	res.header('Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'); //访问控制允许报头 X-Requested-With: xhr请求
	res.header('Access-Control-Allow-Metheds', 'PUT, POST, GET, DELETE, OPTIONS'); //访问控制允许方法
	res.header('X-Powered-By', 'nodejs'); //自定义头信息，表示服务端用nodejs
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});


/**
 * [验证微信接口配置信息，]
 */
app.get('/', function(req, res) {

	const token = config.token; //获取配置的token
	const signature = req.query.signature; //获取微信发送请求参数signature
	const nonce = req.query.nonce; //获取微信发送请求参数nonce
	const timestamp = req.query.timestamp; //获取微信发送请求参数timestamp

	const str = [token, timestamp, nonce].sort().join(''); //排序token、timestamp、nonce后转换为组合字符串
	const sha = sha1(str); //加密组合字符串
	console.log(req.query)
	//如果加密组合结果等于微信的请求参数signature，验证通过
	if (sha === signature) {
		const echostr = req.query.echostr; //获取微信请求参数echostr
		res.send(echostr + ''); //正常返回请求参数echostr
	} else {
		res.send('验证失败');
	}
});

/**
 * [创建请求微信网页授权接口链接]
 */
app.get('/loveXiangXiang', function(req, res) {

	const appid = config.appid;
	const redirect_uri = urlencode(
		"https://2487008qp2.goho.co/code"); //这里的url需要转为加密格式，它的作用是访问微信网页鉴权接口成功后微信会回调这个地址，并把code参数带在回调地址中
	console.log(redirect_uri)
	const scope = 'snsapi_userinfo';
	const url =
		`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=STATE&connect_redirect=1#wechat_redirect`;
	const html =
		`
<html lang="zh-cn">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<style>
	@keyframes ani{
		from{
			transform:rotateY(0deg) rotateX(0deg);
		}
		to{
			transform:rotateY(360deg) rotateX(360deg);
		}
	}
	body{
		perspective:1000px;
	}
	#heart{
		position:relative;
		height:200px;
		width:150px;
		margin:200px auto;
		animation:ani 5s linear infinite; 
		transform-style:preserve-3d;
	}
	.line{
		position:absolute;
		height:200px;
		width:150px;
		border:2px solid red;
		border-left:0;
		border-bottom:0;
		border-radius:50% 50% 0/50% 40% 0;
	}
	#word{
		font-family:"隶书";
		font-size:1.3em;
		color:red;
		position:absolute;
		top: 80px;
		left:22px;
		font-weight:bold;
	}
	</style>
</head>
<body>
	<a style="font-size:78px;text-algin:center;" href="${url}">香香，点它</a>
	<div id="heart">
		<div id="word">I Love You</div>
	</div>
	<script>
		var heart=document.getElementById("heart");
		var html="";
		for(var i=0;i<36;i++){
			html+="<div class='line' style='transform:rotateY("+i*10+"deg) rotateZ(45deg) translateX(25px)'></div>";
		}
		heart.innerHTML += html;
	</script>
</body>
</html>`;

	res.setHeader('Content-Type', 'text/html');
	res.send(html);
});
app.get('/result', function(req, res) {

	const html =
		`<!DOCTYPE html>
    <html>
        <head>
        <meta charset="utf-8" >
        <title>结果反馈</title>
        </head>
        <body><p style="font-size:78px;color:#FF8C69" ">获取成功啦，快去公众号查看吧~~么么哒</p></body>
    </html>`;

	res.setHeader('Content-Type', 'text/html');
	res.send(html);
});


/**
 * 网页授权回调接口，可以获取code
 */
app.get('/code', function(req, res) {
	const code = req.query.code; //微信回调这个接口后会把code参数带过来
	getOpenId(code); //把code传入getOpenId方法   
	res.redirect('/result')
});

/* 定义唯一id */
// let openid = null;
// let access_token = null;

// let openid = 'oZKUm6sgRPi4GUpxZvcX2hcQdegw';  //香香
let openid = 'oZKUm6lXbyT7F7gKPzwFRUWvTHRY'; //我

/**
 * 获取openid
 * @param  { string } code [调用获取openid的接口需要code参数]
 */
function getOpenId(code) {
	const appid = config.appid;
	const secret = config.secret;

	const url =
		`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;

	request(url, function(error, response, body) {

		if (!error && response.statusCode == 200) {
			openid = JSON.parse(body).openid;
			getAccessToken(openid); //获取openid成功后调用getAccessToken
		}

	});
}




/**
 * 获取access_token
 *  @param  { string } openid [发送模板消息的接口需要用到openid参数]
 */
function getAccessToken(openid, template_id) {
	const appid = config.appid;
	const secret = config.secret;
	const grant_type = config.grant_type;

	const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${appid}&secret=${secret}`;

	request(url, function(error, response, body) {

		if (!error && response.statusCode == 200) {

			const access_token = JSON.parse(body).access_token;
			sendTemplateMsg(openid, access_token, template_id); //获取access_token成功后调用发送模板消息的方法
			// setId(openid, access_token);
		} else {
			throw 'update access_token error';
		}
	});


}

/* 设置微信授权 */
function setId(a, b) {
	openid = a;
	access_token = b;
	//立即执行一次
	tsWeather();
}


function timeoutFunc(config, func) {
	config.forEach(item => {
		item.runNow && func()
		const nowTime = new Date().getTime()
		const timePoints = item.time.split(':').map(i => parseInt(i))
		let recent = new Date().setHours(...timePoints)
		recent >= nowTime || (recent += 24 * 3600000)
		setTimeout(() => {
			func()
			setInterval(func, item.interval * 3600000)
		}, recent - nowTime)
	})

}

const tsconfig = [{ //参数的说明
	interval: 1, //间隔天数，间隔为整数
	runNow: true, //是否立即运行
	time: "07:00:00" //执行的时间点 时在0~23之间
}]

function tsWeather() {
	console.log('执行。。。。。。。。。。')
	//香香id
	let id = openid || "oZKUm6lXbyT7F7gKPzwFRUWvTHRY";

	//天气模板
	// let template_id = "nRZLeOgNmRQmoh9IL7IlYPH1wz9F7z9miUwnFiCSppE";
	let template_id = 'vokC79evwSUfdct3nC41NJ9nkFI1HWYDGItSD9JXZQ0'

	getAccessToken(id, template_id);
	// sendTemplateMsg(id, token, template_id);
}
/* 设置定时任务 */
timeoutFunc(tsconfig, tsWeather)

/* 
 根据ip获取地理位置
 */

function getLocaiton(ip) {
	let key = '65e3f927e84093a9fe22fcc23e870cb9'
	const url = `https://restapi.amap.com/v3/ip?key=${key}&ip=${ip}`
	request(url, (error, response, body) => {
		console.log(response.body, 'ip位置')
	})
}

getLocaiton('192.168.1.104')

/* 星期转大写 */
function getWeek(val) {
	if (val === '1') {
		return '一'
	} else if (val === '2') {
		return '二'
	} else if (val === '3') {
		return '三'
	} else if (val === '4') {
		return '四'
	} else if (val === '5') {
		return '五'
	} else if (val === '6') {
		return '六'
	} else {
		return '日'
	}

}


/**
 * 发送模板消息
 * @param  { string } openid [发送模板消息的接口需要用到openid参数]
 * @param  { string } access_token [发送模板消息的接口需要用到access_token参数]
 */
function sendTemplateMsg(openid, access_token, template_id) {
	console.log(openid, 'opid')
	console.log(access_token, 'accessid')

	const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`; //发送模板消息的接口
	//获取天气数据
	request('https://restapi.amap.com/v3/weather/weatherInfo?extensions=all&city=370200&key=65e3f927e84093a9fe22fcc23e870cb9',
		function(error, response, body) {
			if (!error && response.statusCode == 200) {
				let result = JSON.parse(response.body).forecasts[0]
				console.log(result)
				let todayW = result.casts[0];
				let tomorrowW = result.casts[1];
				let nowData = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date()
					.getDate() + ' ' + '星期' + getWeek(todayW.week)
				console.log(nowData)
				let yqDate = ((new Date() - new Date("2022-04-09").getTime()) / (24 * 3600 * 1000)).toFixed(2);
				let brithday = ((new Date() - new Date("1997-06-02").getTime()) / (24 * 3600 * 1000)).toFixed(2);
				let nextBir = parseInt((new Date('2023-06-02') - new Date()) / (24 * 3600 * 1000));
				let msgList = [
					'甜有100种方式，吃糖，蛋糕，还有每天98次的想你',
					"你上辈子一定是碳酸饮料吧，为什么我一看到你就能开心的冒泡。",
					"你知道墙壁，眼睛，膝盖的英文怎么说么? wall,eye,knee 我也是，我爱你",
					"我可以不为别人难过，但你不是别人，你是我的人",
					"前半生到处浪荡，后半生为你煲汤",
					"最近有谣言说我喜欢你，我要澄清一下，那不是谣言。",
					"我是九你是三，除了你还是你",
					"近朱者赤，近你者甜",
					"莫文蔚的阴天，孙燕姿的雨天 周杰伦的晴天，都不如你和我聊天",
					"你上辈子一定是碳酸饮料吧，为什么我一看到你就能开心的冒泡",
					"我的手被划了一道口子 你也划一下 这样我们就是两口子了"
				]
				let msg = msgList[parseInt(Math.random() * 10)];
				let requestData = { //发送模板消息的数据
					touser: openid,
					template_id: template_id,
					url: 'http://weixin.qq.com/download',
					data: {
						"yqData": {
							"value": yqDate,
							"color": "#EE3B3B"
						},
						"area": {
							"value": result.city,
							"color": "#008B00"
						},
						"weater1": {
							"value": todayW.dayweather,
							"color": "#EE7942"
						},
						"weater2": {
							"value": todayW.nightweather,
							"color": "#008B00"
						},
						"wd1": {
							"value": todayW.daytemp + '℃',
							"color": "#008B00"
						},
						"wd2": {
							"value": todayW.nighttemp + '℃',
							"color": "#EE3B3B"
						},
						"shidu": {
							"value": '51' + '%',
							"color": "#EE82EE"
						},
						"brithday": {
							"value": brithday,
							"color": "#EE82EE"
						},
						"msg": {
							"value": msg,
							"color": "#FF4040"
						},
						"time": {
							"value": nowData,
							"color": "#EE7942"
						},
						"fengli": {
							"value": todayW.daypower,
							"color": "#EE3B3B"
						},
						"nextBir": {
							"value": nextBir,
							"color": "#EE82EE"
						},
						"msg2": {
							"value": '今日天气已出炉，奉上~~',
							"color": "#EE82EE"
						}
					}
				};
				console.log(requestData)
				console.log('当前时间：' + new Date())
				let option = {
					url: url,
					method: "POST",
					json: true,
					body: requestData,
					headers: {
						"content-type": "application/json",
					}
				};
				request(option, function(error, response, body) {
					if (!error && response.statusCode == 200) {
						console.log('模板消息推送成功');
					}
				});

			} else {
				throw 'update access_token error';
			}
		});
}

const hostName = '127.0.0.1'; //ip或域名
const port = 8091; //端口
app.listen(port, hostName, function() {
	console.log(`服务器运行在http://${hostName}:${port}`);
});
