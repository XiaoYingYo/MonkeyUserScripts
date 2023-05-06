// ==UserScript==
// @name         抖音增强
// @name:zh-CN   抖音增强
// @name:zh-TW   抖音增強
// @namespace   Violentmonkey Scripts
// @match       *://www.douyin.com/*
// @grant       none
// @version     XiaoYing_2023.05.25.15
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
// @description 抖音无感知去广告 & 跳过直播间 & 跳过购物
// @description:zh-CN 抖音无感知去广告 & 跳过直播间 & 跳过购物
// @description:zh-TW 抖音無感知去廣告 & 跳過直播間 & 跳過購物
// ==/UserScript==

// eslint-disable-next-line no-undef
ajaxHooker.protect();
// eslint-disable-next-line no-unused-vars
var global_module = window['global_module'];
// eslint-disable-next-line no-unused-vars
var globalVariable = new Map();

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
        i++;
    }
    console.log(json);
    // debugger;
    return JSON.stringify(json);
}

function handleResponse(request) {
    if (!request || request.url.indexOf('/aweme/v1/web/tab/feed/') == -1) {
        return;
    }
    request.response = (res) => {
        let responseText = res.responseText;
        if (typeof responseText !== 'string') {
            responseText = res.text;
        }
        res.responseText = handleText(responseText);
        res.text = res.responseText;
    };
}

// eslint-disable-next-line no-undef
ajaxHooker.hook(handleResponse);
