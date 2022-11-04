/*
[task_local]
# 建行生活抢券
5 59 6,7,9 * * * jhsh_coupon.js, tag=建行生活抢券, enabled=true
只能圈×抓包，搜yunbusiness.ccb.com，请求体中的USER_ID，设置JHSH_COUPON_CKS 手机号&USER_ID 多账号@分割 
*/
const $ = new Env('建行生活抢券');
const notify = $.isNode() ? require('./sendNotifySp') : '';
const moment = require('moment')
now_ts = moment().valueOf()
today = moment(now_ts).format('YYYY-MM-DD')
today_xingqi = moment(now_ts).format('E')
sevenOclock_ts = moment(`${today} 07:00:00`).valueOf()
eightOclock_ts = moment(`${today} 08:00:00`).valueOf()
tenOclock_ts = moment(`${today} 10:00:00`).valueOf()
tenHalfOclock_ts = moment(`${today} 10:30:00`).valueOf()
elevenOclock_ts = moment(`${today} 11:00:00`).valueOf()
// test_ts = now_ts + 3000
couponIds = ''
couponMapList = [
    {
        "id": "239987",
        "name": "周一7点 满2-1券",
        "time": "7_1"
    },
    {
        "id": "239961",
        "name": "周二7点 满3-2券",
        "time": "7_2"
    },
    {
        "id": "239968",
        "name": "周三7点 满4-3券",
        "time": "7_3"
    },
    {
        "id": "239973",
        "name": "周四7点 满5-4券",
        "time": "7_4"
    },
    {
        "id": "239979",
        "name": "周五7点 满6-5券",
        "time": "7_5"
    },
    {
        "id": "239980",
        "name": "周六7点 满7-6券",
        "time": "7_6"
    },
    {
        "id": "239984",
        "name": "周日7点 满8-7券",
        "time": "7_7"
    },
    {
        "id": "243175",
        "name": "【数币支付5折起】商超/轻餐满30元减15元券（数字人民币专属）",
        "time": "8"
    },
    {
        "id": "243159",
        "name": "【数币支付5折起】正餐满100元减50元券（数字人民币专属）",
        "time": "8"
    },
    {
        "id": "234460",
        "name": "【每日好券】青岛轻食满12元减6元券",
        "time": "10"
    },
    {
        "id": "241434",
        "name": "每日好券外卖满20元减6元券（龙卡信用卡专享）",
        "time": "10"
    },
]
diff = 0
if (sevenOclock_ts - now_ts <= 60 * 1000) {
    diff = sevenOclock_ts - now_ts
    couponIds = process.env.SEVEN_OCLOCK_COUPON_IDS ? SEVEN_OCLOCK_COUPON_IDS : "239984&239980&239979&239973&239968&239961&239987&234460"
}
if (eightOclock_ts - now_ts <= 60 * 1000) {
    diff = eightOclock_ts - now_ts
    couponIds = process.env.EIGHT_OCLOCK_COUPON_IDS ? EIGHT_OCLOCK_COUPON_IDS : "243175&243159"
}
if (tenOclock_ts - now_ts <= 60 * 1000) {
    couponIds = process.env.TEN_OCLOCK_COUPON_IDS ? TEN_OCLOCK_COUPON_IDS : "234460&241434"
}
if (tenHalfOclock_ts - now_ts <= 60 * 1000) {
    couponIds = process.env.TEN_HELF_OCLOCK_COUPON_IDS ? TEN_HELF_OCLOCK_COUPON_IDS : ""
}
if (elevenOclock_ts - now_ts <= 60 * 1000) {
    couponIds = process.env.ELEVEN_OCLOCK_COUPON_IDS ? ELEVEN_OCLOCK_COUPON_IDS : ""
}
// if (test_ts - now_ts <= 60 * 1000) {
//     couponIds = process.env.ELEVEN_OCLOCK_COUPON_IDS ? ELEVEN_OCLOCK_COUPON_IDS : "241434"
// }
// couponIds = '239984&239980&239979&239973&239968&239961&239987&234460'
if (couponIds == '') {
    console.log('当前时间段没有可抢券！')
    return
}
couponIdArr = couponIds.split('&')
$.url = 'https://yunbusiness.ccb.com/clp_coupon/txCtrl?txcode=A3341C040'
cookies = process.env.JHSH_COUPON_CKS ? process.env.JHSH_COUPON_CKS : ''
if (cookies == '') {
    console.log('未填写建行生活抢券Cookie!')
    return
}
cookieArr = cookies.split('@')
console.log(`\n==========共发现${cookieArr.length}个账号==========\n`)
$.index = 0
$.xingqi = 0
$.couponTime = 0
$.message = ''
!(async () => {
    await $.wait(diff)
    a: for (couponId of couponIdArr) {
        $.couponId = couponId
        $.index = 0
        for (couponInfo of couponMapList) {
            if (couponInfo.id == $.couponId) {
                $.couponName = couponInfo.name
                $.couponTime = couponInfo.time
                if ($.couponTime.indexOf("_") > -1) {
                    $.xingqi = $.couponTime.split("_")[1]
                    $.couponTime = $.couponTime.split("_")[0]
                }
                if ($.xingqi != 0 && $.xingqi != today_xingqi) {
                    console.log(`\n${$.couponName} 非抢券时间`)
                    continue a
                }
            }
        }
        console.log(`\n开始抢券 ${$.couponName}`)
        for (cookie of cookieArr) {
            $.hotFlag = true
            $.needWait = false
            $.isSuccess = false
            $.couponName = ''
            $.errMsg = ''
            $.index++
            $.phone = cookie.split(';')[0]
            $.userId = cookie.split(';')[1]
            console.log(`当前进行的账号为【${$.phone}】`)

            $.UA = `jdapp;iPhone;10.2.2;13.1.2;${uuid()};M/5.0;network/wifi;ADID/;model/iPhone8,1;addressid/2308460611;appBuild/167863;jdSupportDarkMode/0;Mozilla/5.0 (iPhone; CPU iPhone OS 13_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1;`
            for (count = 0; count < 10; count++) {
                if ($.hotFlag == true) {
                    console.log(`开始尝试第${count + 1}次抢券~`)
                    await getCoupon()
                    await $.wait(300)
                    if ($.needWait == true) {
                        await $.wait(500)
                    }
                } else {
                    break
                }
            }
            console.log(`抢券结果：${$.errMsg}`)
            $.message += `账号[${$.phone}] ${$.couponName} ${$.errMsg}\n`
        }
    }
    if ($.message != '') {
        await notify.sendNotify("建行生活抢券通知", `${$.message}`)
    }

})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function getCoupon() {
    let myRequest = getPostRequest();
    // console.log(type + '-->'+ JSON.stringify(myRequest))
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                $.hotFlag = false
                $.needWait = false
                $.isSuccess = false
                dataObj = JSON.parse(data)
                if (err) {
                    $.errMsg = `抢券失败：${dataObj.errMsg}`
                    console.log($.errMsg)
                    if ($.errMsg.indexOf('拥挤') > -1) {
                        $.hotFlag = true
                    }
                    if ($.errMsg.indexOf('限流') > -1) {
                        $.needWait = true
                        $.hotFlag = true
                    }
                } else {
                    $.isSuccess = true
                    if (data.LIST) {
                        console.log(`抢券成功！恭喜获得 ${$.couponName}`)
                        $.errMsg = `抢券成功！恭喜获得 ${$.couponName}`
                    }
                    if (data.coupMap) {
                        console.log(`已经抢过优惠券 ${$.couponName}`)
                        $.errMsg = `已经抢过优惠券 ${$.couponName}`
                    }
                }
            } catch (e) {
                // console.log(data);
                console.log(e, resp)
            } finally {
                resolve();
            }
        })
    })
}


function getPostRequest(method = "POST") {
    let headers = {
        "Accept": "application/json,text/javascript,*/*",
        // "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": $.UA,
        "Content-Type": "application/json",
        // "X-Requested-With": "XMLHttpRequest",
        "Host": "yunbusiness.ccb.com"

    }
    body = getRequestBody()
    // console.log(JSON.stringify(body))
    return { url: $.url, method: method, headers: headers, body: JSON.stringify(body), timeout: 30000 };
}

function getRequestBody() {
    // return `{"req_channel_type": "1","PlatForm_Code": "MCP", "coupon_ID": ${$.couponId},"Mrch_ID": "","Mblph_No": ${$.phone},"Channel_User_ID": ${$.userId},"CLD_SOURCE_CHNL": "01","DtSrc": "MCP","MctGetCoupon_Type": "20","MS_FLAG": "0","CLD_REQ_CHANNEL": "01","MCT_CTMS": {},"COUPON_ID": ${$.couponId},"MEB_ID": ${$.userId},"USR_TEL": ${$.phone},"COUP_CHNL": "01","MSPS_ENTITY": {"PlatForm_Code": "MCP","coupon_ID": ${$.couponId},"Channel_User_ID": ${$.userId},"Mblph_No": ${$.phone},"DtSrc": "MCP"},"chnlType": "1","regionCode": "370200"}`
    return {
        "req_channel_type": "1",
        "PlatForm_Code": "MCP",
        "coupon_ID": $.couponId,
        "Mrch_ID": "",
        "Mblph_No": $.phone,
        "Channel_User_ID": $.userId,
        "CLD_SOURCE_CHNL": "01",
        "DtSrc": "MCP",
        "MctGetCoupon_Type": "20",
        "MS_FLAG": "0",
        "CLD_REQ_CHANNEL": "01",
        "MCT_CTMS": {},
        "COUPON_ID": $.couponId,
        "MEB_ID": $.userId,
        "USR_TEL": $.phone,
        "COUP_CHNL": "01",
        "MSPS_ENTITY": {
            "PlatForm_Code": "MCP",
            "coupon_ID": $.couponId,
            "Channel_User_ID": $.userId,
            "Mblph_No": $.phone,
            "DtSrc": "MCP"
        },
        "chnlType": "1",
        "regionCode": "370200"
    }
}
function uuid(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    return x.replace(/[xy]/g, function (x) {
        const r = 16 * Math.random() | 0, n = "x" === x ? r : 3 & r | 8;
        return n.toString(36)
    })
}

// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
