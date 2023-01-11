/*
[task_local]
# 汇丰汇选-APP
cron:9 9 * * * hfhx.js, tag=汇丰汇选-APP, enabled=true
搜m.prod.app.hsbcfts.com.cn，请求体中的X-HSBC-E2E-Trust-Token，设置HFHX_APP_TOKEN 
多账号@分割 
*/
const $ = new Env('汇丰汇选-APP');
const notify = $.isNode() ? require('./sendNotifySp') : '';
const moment = require('moment');
// const moment = require('moment')
$.shareWids = []
$.lackCardIds = []
$.giftRecords = []
$.lackMsg = ''
$.helpFlag = true // 获取助力码
if (process.env.HFHX_APP_TOKEN) {
    if (process.env.HFHX_APP_TOKEN.indexOf('@') > -1) {
        cookieArr = process.env.HFHX_APP_TOKEN.split('@');
    } else if (process.env.HFHX_APP_TOKEN.indexOf('\n') > -1) {
        cookieArr = process.env.HFHX_APP_TOKEN.split('\n');
    } else {
        cookieArr = [process.env.HFHX_APP_TOKEN];
    }
} else {
    console.log('未发现有效Cookie，请填写HFHX_APP_TOKEN !')
    return
}

console.log(`\n==========共发现${cookieArr.length}个账号==========\n`)
$.index = 0
$.message = ''
!(async () => {
    for (let i = 0; i < cookieArr.length; i++) {
        cookie = cookieArr[i]
        if (cookie.indexOf('&') > -1) {
            $.token = cookie.split('&')[0]
            $.remark = cookie.split('&')[1]
        } else {
            $.token = cookie.split('&')[0]
            $.remark = '匿名用户'
        }
        console.log(`\n🔄 当前进行第${i + 1}个账号，用户备注：${$.remark}`)
        $.index = i + 1
        console.log(`\n===去完成【每周基金资产】任务===`)
        await wealthAccountAsset()
        await $.wait(2000)
        console.log(`\n===去完成【每周其他资产】任务===`)
        await wealthAccounOthertAsset()
        await $.wait(2000)
        console.log(`\n===去完成【健康评估】任务===`)
        await persona()
        await $.wait(2000)
        console.log(`\n===去完成【每日健康打卡】任务===`)
        await healthWeak()
        await $.wait(2000)
        console.log(`\n===去完成【每周理财目标】任务===`)
        await customtag()
        await $.wait(2000)
        console.log(`\n===去完成【每周存钱计划】任务===`)
        await saveorupdatescheduledinvestmentplan()
        await $.wait(2000)
        console.log(`\n===去完成【每日浏览】任务===`)
        await look()
        await $.wait(2000)
        console.log(`\n===去完成【每日分享】任务===`)
        await share()
        await $.wait(2000)
        console.log(`\n===去完成【浏览股票选鸡】任务===`)
        await viewStock()
        await $.wait(2000)
        console.log(`\n===去完成【浏览基金】任务===`)
        await viewFund()
        await $.wait(2000)
        console.log(`\n===去完成【浏览保险】任务===`)
        await viewBaoxian1()
        await $.wait(1000)
        await viewBaoxian2()
        await $.wait(2000)
        console.log(`\n===去完成【基金经理选鸡】任务===`)
        await savemanagerscheme()
        await $.wait(2000)
        console.log(`\n===去完成【阅读两篇文章】任务===`)
        await getArticleList()
        for (let j = 0; j < 2; j++) {
            let articleInfo = $.articleList[j]
            $.articleId = articleInfo.itemId
            await readArticle1()
            console.log('⏰ 等待20s')
            await $.wait(20000)
            await readArticle2()
        }
        console.log(`\n===去完成【分享两篇文章】任务===`)
        for (let j = 0; j < 2; j++) {
            let articleInfo = $.articleList[j]
            $.articleId = articleInfo.itemId
            await shareArticle()
            await $.wait(2000)
        }

        console.log(`\n===去完成【观看两段视频】任务===`)
        await getVideoList()
        for (let j = 0; j < 2; j++) {
            let videoInfo = $.videoList[j]
            $.videoId = videoInfo.itemId
            await viewVideo()
            console.log('⏰ 等待35s')
            await $.wait(35000)
            await viewVideoEvent()
        }
        console.log(`\n===去完成【分享两段视频】任务===`)
        for (let j = 0; j < 2; j++) {
            let videoInfo = $.videoList[j]
            $.videoId = videoInfo.itemId
            await shareVideo()
        }
        $.pointTaskData = []
        $.handlePoint = 0
        await querybubbletask()
        if ($.pointTaskData.length > 0) {
            console.log(`🎯 待领取积分明细`)
            for (let pointTaskData of $.pointTaskData) {
                console.log(`🎟️ ${pointTaskData.pointTaskName} ${pointTaskData.pointAmount}分`)
                $.handlePoint += pointTaskData.pointAmount
            }
            $.handleMsg = `🎟️待领取积分${$.handlePoint}，请登录APP手动领取`
        }

        await querypointsaccountinfo();
        
        $.message += `🎉账号${$.index} ${$.remark} 积分统计\n${$.handleMsg || '没有未领取的积分~'}\n${$.pointMsg}\n\n`
    }
    // console.log($.message)
    await notify.sendNotify("汇丰汇选APP", $.message)


})()
    .finally(() => {
        $.done();
    })

// 每周基金资产
function wealthAccountAsset() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/wealth/account/asset/addasset'
    let body = {
        "windCode": "159828.SZ",
        "dividendWay": 2,
        "assetInvestGoalId": "a18f4969b998480da90ff3ef209d062b",
        "assetPlatformId": "86dd745aa25041a08c96edeb11ebc2bc",
        "buyPeriod": 1,
        "operateType": 20,
        "assetType": 10101,
        "productName": "医疗ETF",
        "ledgerType": 101,
        "startTime": moment().valueOf().toString(),
        "investType": 10101,
        "balance": "100"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每周基金资产任务完成!`)
                } else {
                    console.log(data)
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

// 配置其他资产
function wealthAccounOthertAsset() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/wealth/account/asset/addasset'
    let body =
    {
        "ledgerType": 102,
        "operationStatus": 1,
        "assetPlatformId": "94f2e3bd56234fa1a536b1fcd14da0eb",
        "productName": "蓝色光标",
        "operateType": 20,
        "assetInvestGoalId": "1822339b6a584844803d901bbd5facd5",
        "caiyunCode": "300058.sz",
        "balance": "100",
        "startTime": moment().valueOf().toString()
    }

    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每周基金资产任务完成!`)
                } else {
                    console.log(data)
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

// 健康打卡
function healthWeak() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/ehealth/walk'
    let body = {
        "finish": "5000"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每天健康打卡完成!`)
                } else {
                    console.log(data)
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

// 每周理财目标
function customtag() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/wealth/customtag'
    let body = {
        "operateType": 11,
        "expectedAnnual": "9",
        "customBasicType": 13,
        "investmentHorizon": 2,
        "customTagName": `SJ${moment().valueOf()}`,
        "targetRemark": "测试任务"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每周添加理财目标完成!`)
                } else {
                    console.log(data)
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

function getArticleList() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/mediacms/open/querycmsitempages'
    let body = {
        "feedsFlag": 1,
        "topCmsColumnCode": "HXYLZD",
        "pageIndex": 2,
        "divExtParam": "XHYL3",
        "pageSize": 10
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 获取文章列表成功!`)
                    $.articleList = dataObj.data.cmsItemData
                } else {
                    console.log(data)
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

function getVideoList() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/mediacms/open/querycmsitempages'
    let body = {
        "feedsFlag": 1,
        "topCmsColumnCode": "",
        "pageIndex": 2,
        "pageSize": 10,
        "divExtParam": "SPL01"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 获取视频列表成功!`)
                    $.videoList = dataObj.data.cmsItemData
                } else {
                    console.log(data)
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

function readArticle1() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/marketing/open/information/queryinformationdetail'
    let body = {
        "informationId": $.articleId
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 阅读文章接口调用成功!`)
                } else {
                    console.log(data)
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

function readArticle2() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/marketing/open/userbehavior/behavior'
    let body = {
        "type": 10,
        "mediaContentId": $.articleId,
        "mediaContentType": 1
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 阅读文章成功!`)
                } else {
                    console.log(data)
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
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/marketing/open/userbehavior/behavior'
    let body = {
        "type": 7,
        "mediaContentId": $.articleId,
        "mediaContentType": 1
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 分享一篇文章完成!`)
                } else {
                    console.log(data)
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

function shareVideo() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/marketing/open/userbehavior/behavior'
    let body = {
        "eventMode": 0,
        "mediaContentType": 4,
        "type": 7,
        "mediaContentId": $.videoId
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 分享一段视频完成!`)
                } else {
                    console.log(data)
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

function viewVideo() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/marketing/open/userbehavior/behavior'
    let body = {
        "eventMode": 0,
        "mediaContentType": 4,
        "type": 6,
        "mediaContentId": $.videoId
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 浏览视频接口调用成功!`)
                } else {
                    console.log(data)
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

function viewVideoEvent() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/tracebehaviorlog/addtrace'
    let body = {
        "traceBehaviorStatus": 1,
        "traceBehaviorScenes": "VIDEO_MARKETING_TASK",
        "extBizId": $.videoId,
        "traceBehaviorAction": "VIEW_PAGE"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 分享一篇文章完成!`)
                } else {
                    console.log(data)
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

// 每周建立存钱计划
function saveorupdatescheduledinvestmentplan() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/wealth/account/pension/saveorupdatescheduledinvestmentplan'
    let body = {
        "status": 1,
        "timeUnit": "11",
        "fixedTarget": 1,
        "startDate": moment().valueOf().toString(),
        "days": "10",
        "depositAmount": "100",
        "timePeriod": "1",
        "reminderStatus": 2
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每周建立存钱计划完成!`)
                } else {
                    console.log(data)
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

// 每日浏览任务
function look() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/tracebehaviorlog/addtrace'
    let body = {
        "traceBehaviorStatus": 1,
        "traceBehaviorScenes": "INVESTMENT_INDEX",
        "traceBehaviorAction": "VIEW_PAGE"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每日浏览任务完成!`)
                } else {
                    console.log(data)
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

// 每日分享任务
function share() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/tracebehaviorlog/addtrace'
    let body = {
        "traceBehaviorStatus": 1,
        "traceBehaviorScenes": "INVESTMENT_INDEX",
        "traceBehaviorAction": "SHARE"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 每日分享任务完成!`)
                } else {
                    console.log(data)
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

// 体验股票选鸡任务
function viewStock() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/tracebehaviorlog/addtrace'
    let body = {
        "extBizId": "",
        "traceBehaviorStatus": "1",
        "traceBehaviorScenes": "STOCK_FUND_DETAIL",
        "traceBehaviorAction": "VIEW_PAGE",
        "behaviorMessage": ""
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 体验股票选鸡任务完成!`)
                } else {
                    console.log(data)
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

// 浏览保险页面
function viewBaoxian1() {

    return new Promise(async resolve => {
        let get = {
            url: 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/targetlink/open/checkthirdpartyapplogininfo?thirdPartyAppId=73dbd40040',
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ios-river-app statusBarHeight/47.0',
                "Content-Type": "application/json",
                "Host": "m.prod.app.hsbcfts.com.cn",
                "X-HSBC-E2E-Trust-Token": $.token,
                "X-HSBC-Global-Channel-Id": "MOBILE"
                // "Origin": "https://m.prod.app.hsbcfts.com.cn",
                // "X-HSBC-Request-Correlation-Id": $.deviceCode,
                // "X-HSBC-Pinnacle-DeviceNo": $.deviceCode

            },
            timeout: 30000
        }
        $.get(get, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    // console.log(`✅ 浏览保险页面任务完成!`)
                } else {
                    console.log(data)
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

function viewBaoxian2() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/targetlink/open/getthirdpartylinkinfo'
    let body = {
        "thirdPartyAppId": "73dbd40040"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 浏览保险页面任务完成!`)
                } else {
                    console.log(data)
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

function querypointsaccountinfo() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/pointstask/querypointsaccountinfo'
    let body = {
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`🎁 总积分${dataObj.data.pointsBalance}，当前红包${dataObj.data.redEnvelopeAmount}元`)
                    $.pointMsg = `🎁 总积分${dataObj.data.pointsBalance}，当前红包${dataObj.data.redEnvelopeAmount}元`
                } else {
                    console.log(data)
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

// 基金页面浏览任务
function viewFund() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/biz/tracebehaviorlog/addtrace'
    let body = {
        "traceBehaviorStatus": 1,
        "traceBehaviorScenes": "FUNDX",
        "traceBehaviorAction": "VIEW_PAGE"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 浏览基金任务完成!`)
                } else {
                    console.log(data)
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

// 体验基金经理选鸡工具
function savemanagerscheme() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/api/v1/fund/scheme/savemanagerscheme'
    let body = {
        "performanceList": [
            {
                "reference": "基金经理累计收益率采用基金经理管理基金的规模加权收益率计算。一般来说，基金经理累计收益率越高，表现越好。对于统计区间小于3年的累计收益率，不能反映该基金经理的长期收益表现，仅供参考。数据来自Wind资讯。",
                "iconUrl": "assets\/selector\/fund8.png",
                "isRadio": 2,
                "parentType": 3,
                "typeName": "累计收益率",
                "typeCode": 301,
                "boxInfoList": [
                    {
                        "layoutPosition": 1,
                        "name": "前25%",
                        "code": "30101"
                    },
                    {
                        "layoutPosition": 2,
                        "name": "前25%~50%",
                        "code": "30102"
                    },
                    {
                        "layoutPosition": 3,
                        "name": "后25%~50%",
                        "code": "30103"
                    },
                    {
                        "layoutPosition": 4,
                        "name": "后25%",
                        "code": "30104"
                    }
                ]
            },
            {
                "reference": "基金经理年化波动率基于基金经理管理基金的规模加权收益率计算。一般来说，基金经理年化波动率越低，表现越好。对于统计区间小于3年的年化波动率，不能反映该基金经理长期的风险水平，仅供参考。数据来自Wind资讯。",
                "iconUrl": "assets\/selector\/fund9.png",
                "isRadio": 2,
                "parentType": 3,
                "typeName": "年化波动率",
                "typeCode": 302,
                "boxInfoList": [
                    {
                        "layoutPosition": 1,
                        "name": "前25%",
                        "code": "30201"
                    },
                    {
                        "layoutPosition": 2,
                        "name": "前25%~50%",
                        "code": "30202"
                    },
                    {
                        "layoutPosition": 3,
                        "name": "后25%~50%",
                        "code": "30203"
                    },
                    {
                        "layoutPosition": 4,
                        "name": "后25%",
                        "code": "30204"
                    }
                ]
            },
            {
                "reference": "基金经理最大回撤基于基金经理管理基金的规模加权收益率计算。最大回撤大致反映了在该统计区间内投资该基金经理旗下基金产品可能遭受的最大损失比例。一般来说，基金最大回撤越小，表现越好。数据来自Wind资讯。",
                "iconUrl": "assets\/selector\/fund10.png",
                "isRadio": 2,
                "parentType": 3,
                "typeName": "最大回撤",
                "typeCode": 303,
                "boxInfoList": [
                    {
                        "layoutPosition": 1,
                        "name": "前25%",
                        "code": "30301"
                    },
                    {
                        "layoutPosition": 2,
                        "name": "前25%~50%",
                        "code": "30302"
                    },
                    {
                        "layoutPosition": 3,
                        "name": "后25%~50%",
                        "code": "30303"
                    },
                    {
                        "layoutPosition": 4,
                        "name": "后25%",
                        "code": "30304"
                    }
                ]
            },
            {
                "reference": "定义为在统计区间内（该基金经理的年化收益率-无风险收益率) \/ 该基金经理的年化波动率，反映了投资于该基金经理管理产品的投资者额外承受的每一单位风险所获得的额外收益。计算基于基金经理管理基金的规模加权收益率。其中无风险收益率采用wind货币基金指数收益率。数据来自wind资讯。",
                "iconUrl": "assets\/selector\/fund11.png",
                "isRadio": 2,
                "parentType": 3,
                "typeName": "夏普比率",
                "typeCode": 304,
                "boxInfoList": [
                    {
                        "layoutPosition": 1,
                        "name": "前25%",
                        "code": "30401"
                    },
                    {
                        "layoutPosition": 2,
                        "name": "前25%~50%",
                        "code": "30402"
                    },
                    {
                        "layoutPosition": 3,
                        "name": "后25%~50%",
                        "code": "30403"
                    },
                    {
                        "layoutPosition": 4,
                        "name": "后25%",
                        "code": "30404"
                    }
                ]
            }
        ],
        "performanceRange": "502",
        "schemeName": `ZX${moment().valueOf()}`,
        "basicTypeList": [
            {
                "reference": "",
                "iconUrl": "assets\/fund\/manager\/manager2.png",
                "isRadio": 1,
                "parentType": 2,
                "empty": null,
                "typeName": "从业年限",
                "typeCode": 201,
                "boxInfoList": [
                    {
                        "name": "大于10年",
                        "code": "20104"
                    }
                ],
                "all": false
            },
            {
                "reference": "基金经理在上一个报告期此类基金的在管总资产净值。数据来自Wind数据。",
                "iconUrl": "assets\/fund\/manager\/manager1.png",
                "isRadio": 2,
                "parentType": 2,
                "empty": null,
                "typeName": "该类别基金在管总规模",
                "typeCode": 203,
                "boxInfoList": [
                    {
                        "name": "1亿以下",
                        "code": "20301"
                    },
                    {
                        "name": "1到5亿",
                        "code": "20302"
                    },
                    {
                        "name": "5到10亿",
                        "code": "20303"
                    },
                    {
                        "name": "10到20亿",
                        "code": "20304"
                    },
                    {
                        "name": "20到50亿",
                        "code": "20305"
                    },
                    {
                        "name": "50亿以上",
                        "code": "20306"
                    }
                ],
                "all": false
            }
        ],
        "fundType": 7,
        "conditionCount": 23
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 体验基金经理选鸡任务完成!`)
                } else {
                    console.log(data)
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
// 健康评估
function persona() {
    let url = 'https://m.prod.app.hsbcfts.com.cn/api/sapp/ehealth/persona'
    let body = {
        "smoke": "0",
        "gender": "1",
        "sport": 7,
        "age": 30,
        "drink": "0",
        "cooking": "0",
        "sleep": 7,
        "mood": "1",
        "type": "3",
        "taste": "1"
    }
    let myRequest = getPostRequest(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    console.log(`✅ 健康评估任务完成!`)
                } else {
                    console.log(data)
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

function getPostRequest(url, body, method = "POST") {
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ios-river-app statusBarHeight/47.0',
        "Content-Type": "application/json",
        "Host": "m.prod.app.hsbcfts.com.cn",
        "X-HSBC-E2E-Trust-Token": $.token,
        "X-HSBC-Global-Channel-Id": "MOBILE"
        // "Origin": "https://m.prod.app.hsbcfts.com.cn",
        // "X-HSBC-Request-Correlation-Id": $.deviceCode,
        // "X-HSBC-Pinnacle-DeviceNo": $.deviceCode

    }
    return { url: url, method: method, headers: headers, body: JSON.stringify(body), timeout: 30000 };
}


function querybubbletask() {
    let url = 'https://mw.prod.app.hsbcfts.com.cn/api/sapp/biz/pointstask/querybubbletask'
    let body = {
        "pageSize": 20,
        "pageIndex": 1
    }
    let myRequest = getPostRequest2(url, body);
    return new Promise(async resolve => {
        $.post(myRequest, (err, resp, data) => {
            try {
                dataObj = JSON.parse(data)
                if (dataObj.retCode == 10000) {
                    $.pointTaskData = dataObj.data.pointTaskData
                } else {
                    console.log(data)
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

function getPostRequest2(url, body, method = "POST") {
    let headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "User-Agent": 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 ios-river-app statusBarHeight/47.0',
        "Content-Type": "application/json",
        "Host": "mw.prod.app.hsbcfts.com.cn",
        "X-HSBC-E2E-Trust-Token": $.token,
        "X-HSBC-Global-Channel-Id": "MOBILE"
        // "Origin": "https://m.prod.app.hsbcfts.com.cn",
        // "X-HSBC-Request-Correlation-Id": $.deviceCode,
        // "X-HSBC-Pinnacle-DeviceNo": $.deviceCode

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
