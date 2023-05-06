// ==UserScript==
// @name         抖音增强
// @name:zh-CN   抖音增强
// @name:zh-TW   抖音增強
// @namespace   Violentmonkey Scripts
// @match       *://www.douyin.com/*
// @grant       none
// @version     1.0
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
// @require https://scriptcat.org/lib/637/1.2.4/ajaxHooker.js
// @description 抖音无感知去广告 & 跳过直播间
// @description:zh-CN 抖音无感知去广告 & 跳过直播间
// @description:zh-TW 抖音無感知去廣告 & 跳過直播間
// ==/UserScript==

// eslint-disable-next-line no-unused-vars
var global_module = window['global_module'];
// eslint-disable-next-line no-unused-vars
var globalVariable = new Map();
const HookUrl = '/aweme/v1/web/tab/feed/';

function handleResponse(request) {
    if (!request || request.url.indexOf(HookUrl) == -1) {
        return;
    }
    request.response = (res) => {
        const responseText = res.responseText; // 注意保存原数据
        res.responseText = new Promise((resolve) => {
            let newText = responseText;
            let json = JSON.parse(newText);
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
                        i++;
                        continue;
                    }
                }
                let is_ads = item['is_ads'];
                if (is_ads) {
                    aweme_list.splice(i, 1);
                    i++;
                    continue;
                }
                i++;
            }
            json['aweme_list'] = aweme_list;
            newText = JSON.stringify(json);
            console.log(json);
            resolve(newText);
        });
    };
}

// eslint-disable-next-line no-undef
ajaxHooker.filter([{ type: 'xhr', url: location.host, method: 'GET' }]);
// eslint-disable-next-line no-undef
ajaxHooker.hook(handleResponse);
