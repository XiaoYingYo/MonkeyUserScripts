// ==UserScript==
// @name         抖音增强
// @name:zh-CN   抖音增强
// @name:zh-TW   抖音增強
// @namespace   Violentmonkey Scripts
// @match       *://www.douyin.com/*
// @version     XiaoYing_2024.08.04.1
// @grant       GM_info
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_addStyle
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM_registerMenuCommand
// @grant       GM_unregisterMenuCommand
// @grant       GM_getResourceText
// @grant       GM_getResourceURL
// @grant       GM_openInTab
// @grant       unsafeWindow
// @run-at      document-start
// @author      github.com @XiaoYingYo
// @require     https://greasyfork.org/scripts/464929-module-jquery-xiaoying/code/module_jquery_XiaoYing.js
// @require     https://greasyfork.org/scripts/464780-global-module/code/global_module.js
// @require     https://greasyfork.org/scripts/465643-ajaxhookerlatest/code/ajaxHookerLatest.js
// @description 抖音无感知去广告 & 去直播间 & 去购物视频 & 去壁纸视频 & 作品视频列表获取更多数量 & 首页一次性加载更多视频
// @description:zh-CN 抖音无感知去广告 & 去直播间 & 去购物视频 & 去壁纸视频 & 作品视频列表获取更多数量 & 首页一次性加载更多视频
// @description:zh-TW 抖音無感知去廣告 & 去直播間 & 去購物視頻 & 去壁紙視頻 & 作品視頻列表獲取更多數量 & 首頁一次性加載更多視頻
// ==/UserScript==

// eslint-disable-next-line no-undef
ajaxHooker.protect();
var globalVariable = new Map();
globalVariable.set('cacheVideoId', new Map());

function handleText(Text) {
    let json = null;
    try {
        json = JSON.parse(Text);
    } catch (e) {
        console.log(e);
    }
    if (!json) {
        return;
    }
    let aweme_list = json['aweme_list'];
    if (!aweme_list) {
        return;
    }
    let i = 0;
    while (i < aweme_list.length) {
        let item = aweme_list[i];
        let id = item['aweme_id'];
        if (globalVariable.get('cacheVideoId').get(id)) {
            aweme_list.splice(i, 1);
            continue;
        }
        let cell_room = item['cell_room'];
        if (cell_room != null) {
            let DouYing_QQ759852125_use_cell_room = localStorage.getItem('DouYing_QQ759852125_use_cell_room') || false;
            if (!DouYing_QQ759852125_use_cell_room) {
                aweme_list.splice(i, 1);
                continue;
            }
        }
        let is_ads = item['is_ads'];
        if (is_ads) {
            aweme_list.splice(i, 1);
            continue;
        }
        let anchor_info = item['anchor_info'];
        if (anchor_info) {
            let anchor_info_type = anchor_info['type'];
            if (anchor_info_type === 3) {
                let DouYing_QQ759852125_use_shop = localStorage.getItem('DouYing_QQ759852125_use_shop') || false;
                if (!DouYing_QQ759852125_use_shop) {
                    aweme_list.splice(i, 1);
                    continue;
                }
            }
        }
        globalVariable.get('cacheVideoId').set(id, 0);
        i++;
    }
    return JSON.stringify(json);
}

const ignoreStr = '&ignoreHook=true';

function handleResponse(request) {
    if (!request) {
        return;
    }
    if (request.url.indexOf(ignoreStr) != -1) {
        return;
    }
    if (request.url.indexOf('/aweme/v1/web/aweme/post/') != -1) {
        let count = global_module.GetUrlParm(request.url, 'count');
        count = 40;
        let newUrl = global_module.SetUrlParm(request.url, 'count', count);
        request.url = newUrl;
        return;
    }
    if (request.url.indexOf('/aweme/v1/web/tab/feed/') != -1) {
        request.response = (res) => {
            let responseText = res.responseText;
            if (typeof responseText !== 'string') {
                responseText = res.text;
            }
            res.responseText = new Promise((resolve) => {
                res.responseText = handleText(responseText);
                res.text = res.responseText;
                if (request.type !== 'xhr') {
                    resolve(res.text);
                    return;
                }
                (async function () {
                    let oldJson = JSON.parse(res.text);
                    let oldAwemeList = oldJson['aweme_list'];
                    let Num = localStorage.getItem('DouYing_QQ759852125_getAdditionalVideos') || 2;
                    Num = parseInt(Num);
                    if (Num > 10) {
                        Num = 10;
                    }
                    if (Num !== 0) {
                        let Tasks = [];
                        for (let i = 0; i < Num; i++) {
                            Tasks.push(
                                new Promise((resolve) => {
                                    let Xhr = new XMLHttpRequest();
                                    let url = request.url + ignoreStr;
                                    Xhr.open('GET', url, false);
                                    Xhr.onreadystatechange = function () {
                                        let text = Xhr.responseText;
                                        text = handleText(text);
                                        let json = JSON.parse(text);
                                        let AwemeList = json['aweme_list'];
                                        oldAwemeList.push(...AwemeList);
                                        resolve();
                                    };
                                    Xhr.send();
                                })
                            );
                        }
                        await Promise.all(Tasks);
                        let newJson = JSON.stringify(oldJson);
                        resolve(newJson);
                    } else {
                        resolve(res.text);
                    }
                })();
            });
        };
        return;
    }
}

// eslint-disable-next-line no-undef
ajaxHooker.hook(handleResponse);
