/*
[task_local]
# 统一—世界杯集卡
0 0 * * * qddt.js, tag=统一—世界杯集卡, enabled=true
搜api.qd-metro.com，请求体中的token和deviceCoding，设置QDDT_CKS token;deviceCoding 多账号@分割 
*/
const $ = new Env('统一—世界杯集卡');
// const notify = $.isNode() ? require('./sendNotifySp') : '';
// const moment = require('moment')
$.shareWids = []
$.lackCardIds = []
$.giftRecords = []
$.lackMsg = ''
$.helpFlag = true // 获取助力码
if (process.env.TY_CARD_TOKENS) {
    if (process.env.TY_CARD_TOKENS.indexOf('@') > -1) {
        cookieArr = process.env.TY_CARD_TOKENS.split('@');
    } else if (process.env.TY_CARD_TOKENS.indexOf('\n') > -1) {
        cookieArr = process.env.TY_CARD_TOKENS.split('\n');
    } else {
        cookieArr = [process.env.TY_CARD_TOKENS];
    }
} else {
    console.log('未发现有效Cookie，请填写TY_CARD_TOKENS!')
    return
}

console.log(`\n==========共发现${cookieArr.length}个账号==========\n`)
$.index = 0
$.message = ''
!(async () => {
    // 获取助力码
    console.log(`🧑‍🤝‍🧑 =====开始获取助力码=====`)
    for (let cookie of cookieArr) {
        $.token = cookie
        await queryUserInfo()
    }
    console.log(`\n====================\n`)
    console.log(`🧑‍🤝‍🧑 =====当前助力池为=====`)
    for (let wid of $.shareWids) {
        console.log(`🙎‍♂️ ${wid}`)
    }
    console.log(`\n====================\n`)
    console.log(`🧑‍🤝‍🧑 =====开始互助=====`)
    $.helpFlag = false
    for (let i = 0; i < cookieArr.length; i++) {
        $.token = cookieArr[i]
        await queryUserInfo()
        for (let j = 0; j < $.shareWids.length; j++) {
            if (i == j) {
                continue
            }
            console.log(`第${i + 1}个账号去助力第${j + 1}个账号`)
            $.shareWid = $.shareWids[j]
            await helpLightCard()
        }
    }
    console.log(`\n====================\n`)
    console.log(`🧑‍🤝‍🧑 =====开始抽卡=====`)
    for (let i = 0; i < cookieArr.length; i++) {
        $.stopDraw = false
        $.token = cookieArr[i]
        await queryUserInfo()
        $.index = i + 1
        for (let j = 0; j < 5; j++) {
            await lightCard()
            if ($.stopDraw === true) {
                break
            }
            await $.wait(3000)
        }
        await index()
        if ($.index == 1) {
            console.log($.lackMsg)
        } else {
            if ($.prizeCardId != '') {
                await giftCard()
                await $.wait(2000)
                $.giftRecords.push(`${$.shareWids[i]}&${$.prizeCardId}`)
            }
        }
    }
    if ($.giftRecords.length > 0) {
        console.log(`\n====================\n`)
        console.log(`🧑‍🤝‍🧑 =====车头去接受赠卡=====`)
        $.token = cookieArr[0]
        $.index = 1
        await queryUserInfo()
        for (let giftRecord of $.giftRecords) {
            $.shareWid = giftRecord.split('&')[0]
            $.prizeCardId = giftRecord.split('&')[1]
            await receiveCard()
        }
        await index()
    }

    // console.log($.message)
    // await notify.sendNotify("统一世界杯集卡", `${$.message.join('')}`)


})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function queryUserInfo() {
    let url = 'https://xapi.weimob.com/api3/onecrm/user/center/usercenter/queryUserInfo'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(dataObj.errmsg)
                } else {
                    data = dataObj.data
                    console.log(`\n✅ 获取用户信息成功!`)
                    $.nickName = data.nickname
                    console.log(`👤 当前登录人：${$.nickName}`)
                    if ($.helpFlag === true) {
                        $.shareWids.push(data.wid)
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

function helpLightCard() {
    let url = 'https://xapi.weimob.com/api3/interactive/qianxi/amasscard/api/helpLightCard'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(`助力失败：${dataObj.errmsg}`)
                } else {
                    data = dataObj.data
                    console.log(`🎉 助力成功：【${data.ownerNick}】获得卡片【${data.cardName}】`)
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

function lightCard() {
    let url = 'https://xapi.weimob.com/api3/interactive/qianxi/amasscard/api/lightCard'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                $.prizeCardId = ''
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(`抽卡失败：${dataObj.errmsg}`)
                    if (dataObj.errmsg.indexOf('上限') > -1) {
                        $.stopDraw = true
                    }
                } else {
                    data = dataObj.data
                    console.log(`🎉 抽卡成功：获得卡片【${data.cardId}】`)
                    $.prizeCardId = data.cardId
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

function index() {
    let url = 'https://xapi.weimob.com/api3/interactive/qianxi/amasscard/api/index'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                $.prizeCardId = ''
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(`${dataObj.errmsg}`)
                } else {
                    data = dataObj.data
                    theme = data.theme
                    console.log(`🎟️ 卡片详情`)
                    for (let cardInfo of theme.cards) {
                        console.log(`⚽ ${cardInfo.cardName} ${cardInfo.cardAmassedNum}张`)
                        if (cardInfo.cardAmassedNum == 0 && $.index == 1) {
                            $.lackMsg += `🏷️ 车头缺少卡片【${cardInfo.cardId} ${cardInfo.cardName}】\n`
                            $.lackCardIds.push(cardInfo.cardId)
                        }
                        if (cardInfo.cardAmassedNum == 1 && $.index != 1) {
                            for (let lackCardId of $.lackCardIds) {
                                if (lackCardId == cardInfo.cardId) {
                                    console.log(`当前卡片【${cardInfo.cardId}】车头未得到，去赠送-->`)
                                    $.prizeCardId = cardInfo.cardId
                                }
                            }
                        }
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

function giftCard() {
    let url = 'https://xapi.weimob.com/api3/interactive/qianxi/amasscard/api/giftCard'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(`赠送失败：${dataObj.errmsg}`)
                } else {
                    data = dataObj.data
                    console.log(`🏷️ 赠送成功【${data.id}】`)
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

function receiveCard() {
    let url = 'https://xapi.weimob.com/api3/interactive/qianxi/amasscard/api/receiveCard'
    let myRequest = getPostRequest(url);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.errcode != '0') {
                    console.log(`收卡失败：${dataObj.errmsg}`)
                } else {
                    data = dataObj.data
                    console.log(`🏷️ 收卡成功，获得卡片【${data.id}】`)
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


function getPostRequest(url, method = "POST") {
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": $.UA,
        "Content-Type": "application/json",
        "Host": "xapi.weimob.com",
        "X-WX-Token": $.token
    }
    body = {
        "appid": "",
        "basicInfo": {
            "vid": 6013753979957,
            "bosId": 4020112618957,
            "productInstanceId": 3168798957,
            "tcode": "weimob",
            "cid": 176205957,
            "productId": 146
        },
        "extendInfo": {},
        "queryParameter": null,
        "pid": "",
        "storeId": "0",
        "activityId": 20000334374,
        "source": 1,
        "_version": "2.9.1",
        "appletVersion": 280,
        "ownerWid": $.shareWid,
        "_transformBasicInfo": true,
        "v": "",
        "operationSource": 4,
        "vid": 6013753979957,
        "vidType": 2,
        "bosId": 4020112618957,
        "productId": 165646,
        "productInstanceId": 3169913957,
        "giftCardId": $.prizeCardId || 0,
        "productVersionId": "",
        "merchantId": 0,
        "tcode": "",
        "cid": 0,
        "vidTypes": [
            2
        ],
        "openid": ""
    }
    return { url: url, method: method, headers: headers, body: JSON.stringify(body), timeout: 30000 };
}

function uuid(x = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    return x.replace(/[xy]/g, function (x) {
        const r = 16 * Math.random() | 0, n = "x" === x ? r : 3 & r | 8;
        return n.toString(36)
    })
}

// prettier-ignore
function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
