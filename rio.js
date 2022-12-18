const { json } = require("stream/consumers");

/*
[task_local]
# 小程序-RIO会员中心
15 8 * * * rio.js, tag=小程序-RIO会员中心, enabled=true
搜club.rioalc.com，请求头的Authorization，设置RIO_TOKENS 多账号@分割 
*/
const $ = new Env('小程序-RIO会员中心');
const notify = $.isNode() ? require('./sendNotifySp') : '';
const moment = require('moment')
if (process.env.RIO_TOKENS) {
    if (process.env.RIO_TOKENS.indexOf('@') > -1) {
        cookieArr = process.env.RIO_TOKENS.split('@');
    } else if (process.env.RIO_TOKENS.indexOf('\n') > -1) {
        cookieArr = process.env.RIO_TOKENS.split('\n');
    } else {
        cookieArr = [process.env.RIO_TOKENS];
    }
} else {
    console.log('未发现有效Cookie，请填写RIO_TOKENS!')
    return
}
$.commits = ["真的很不错", "真的很棒", "支持支持支持", "顶顶顶", "种草了~"]
console.log(`\n==========共发现${cookieArr.length}个账号==========\n`)
$.index = 0
$.message = ''

!(async () => {
    for (let i = 0; i < cookieArr.length; i++) {
        cookie = cookieArr[i]
        if (cookie.indexOf('&') > -1) {
            $.cookie = cookie.split('&')[0]
            $.remark = cookie.split('&')[1]
        } else {
            $.cookie = cookie
            $.remark = '匿名用户'
        }
        $.likeNum = 0
        $.commentNum = 0
        $.submitNum = 0
        console.log(`\n🔄 当前进行第${i + 1}个账号\n`)
        await getUserInfo()
        console.log("\n========每日签到========\n")
        await signIn()
        await getSignInfo()
        if (isFirstDay() == true) {
            console.log('\n========月度任务========\n')
            a: for (let pageNo = 1; pageNo < 2000; pageNo++) {
                $.pageNo = pageNo
                await getPageInfo()
                for (let article of $.page) {
                    if (article.is_like == 0) {
                        $.articleId = article.id
                        console.log(`👍 去点赞文章【${article.title}】`)
                        await likeArticle()
                        await $.wait(1500)
                        console.log(`✏️ 去评论文章【${article.title}】`)
                        await commentArticle()
                        await $.wait(1500)
                        console.log(`✏️ 去分享文章【${article.title}】`)
                        await shareArticle()
                        await $.wait(1500)
                        $.likeNum++
                        if ($.likeNum >= 5) {
                            console.log(`✅ 已点赞、评论5篇文章，任务完成`)
                            break a
                        }
                    }
                }
            }
            await getMyPageInfo()
            if ($.myPage.length > 0) {
                for (let myArticleInfo of $.myPage) {
                    $.articleId = myArticleInfo.id
                    console.log(`🧹 去删除文章【${myArticleInfo.title}】`)
                    await delArticle()
                    await $.wait(2000)
                }
            }
            console.log(`✏️ 去发表文章`)
            for (let j = 0; j < 5; j++) {
                await createArticle()
                await $.wait(2000)
            }
            await getMyPageInfo()
            if ($.myPage.length > 0) {
                for (let myArticleInfo of $.myPage) {
                    $.articleId = myArticleInfo.id
                    console.log(`🧹 去删除文章【${myArticleInfo.title}】`)
                    await delArticle()
                    await $.wait(2000)
                }
            }
        }
        await getUserInfo()
        $.message += `${$.userInfo}\n`
    }
    if ($.message != '') {
        await notify.sendNotify("RIO会员积分", `${$.message}`)
    }

})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

function signIn() {
    let url = 'https://club.rioalc.com/api/miniprogram/user-sign-click'
    let body = {
    }

    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function isFirstDay() {
    startDay = moment().startOf("month").format("YYYY-MM-DD")
    today = moment().format("YYYY-MM-DD")
    return startDay == today
}

function commentArticle() {
    let url = `https://club.rioalc.com/api/miniprogram/post-comment/${$.articleId}`
    let randomidx = Math.round(Math.random() * $.commits.length)
    if (randomidx > ($.commits.length - 1)) {
        randomidx = $.commits.length - 1
    }
    let body = {
        "comment": $.commits[randomidx]
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function likeArticle() {
    let url = `https://club.rioalc.com/api/miniprogram/post-likes/${$.articleId}`
    let body = {
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function shareArticle() {
    let url = `https://club.rioalc.com/api/miniprogram/post-share/${$.articleId}`
    let body = {
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function createArticle() {
    let url = `https://club.rioalc.com/api/miniprogram/post-create`
    let body = {
        "post_content": "如题，这个铁汁只是用来水经验。",
        "post_title": "这个铁汁只是用来水经验",
        "images": [
            "https:\/\/club-oss.rioalc.com\/uploads\/rio\/temporary\/2022-12-18\/ztS9rg4xrj369yUECP64CY5ypndZlwYyR8ycvs57.jpg"
        ],
        "topic_id": 20
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function delArticle() {
    let url = `https://club.rioalc.com/api/miniprogram/post-del/${$.articleId}`
    let body = {
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.code === 200) {
                    console.log(`✅ ${dataObj.message}`)
                } else {
                    console.log(`💥 ${dataObj.message}`)
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

function getUserInfo() {
    return new Promise(resolve => {
        let get = {
            url: `https://club.rioalc.com/api/miniprogram/user-info`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": $.UA,
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "club.rioalc.com",
                "Authorization": $.cookie
            },
            timeout: 30000
        }
        $.get(get, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getUserInfo API请求失败`)
                } else {
                    dataObj = JSON.parse(data)
                    console.log(`✅ 获取用户信息成功\n🎟️ 当前登录人：${dataObj.data.nick_name}，总积分：${dataObj.data.points}`)
                    $.userInfo = `${dataObj.data.nick_name}，总积分：${dataObj.data.points}`
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getSignInfo() {
    return new Promise(resolve => {
        let get = {
            url: `https://club.rioalc.com/api/miniprogram/user-sign-info`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": $.UA,
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "club.rioalc.com",
                "Authorization": $.cookie
            },
            timeout: 30000
        }
        $.get(get, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getUserInfo API请求失败`)
                } else {
                    dataObj = JSON.parse(data)
                    console.log(`📆 已连续签到${dataObj.data.continue_click_times}`)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getPageInfo() {
    return new Promise(resolve => {
        let get = {
            url: `https://club.rioalc.com/api/miniprogram/brand-post?page=${$.pageNo}&brand_key=`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": $.UA,
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "club.rioalc.com",
                "Authorization": $.cookie
            },
            timeout: 30000
        }
        $.get(get, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getUserInfo API请求失败`)
                } else {
                    dataObj = JSON.parse(data)
                    $.page = dataObj.data
                    console.log(`✅ 获取第${$.pageNo}页文章列表成功！`)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getMyPageInfo() {
    return new Promise(resolve => {
        let get = {
            url: `https://club.rioalc.com/api/miniprogram/mine-post?page=1`,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": $.UA,
                "Content-Type": "application/json;charset=UTF-8",
                "Host": "club.rioalc.com",
                "Authorization": $.cookie
            },
            timeout: 30000
        }
        $.get(get, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`getUserInfo API请求失败`)
                } else {
                    dataObj = JSON.parse(data)
                    $.myPage = dataObj.data
                    console.log(`✅ 获取自己发表的文章列表成功！`)
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getPostRequest(url, body, method = "POST") {
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": $.UA,
        "Content-Type": "application/json;charset=UTF-8",
        "Host": "club.rioalc.com",
        "Authorization": $.cookie
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
