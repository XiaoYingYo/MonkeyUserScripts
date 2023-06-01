// ==UserScript==
// @name         阿里网盘一次性加载更多项
// @name:en      阿里网盘一次性加载更多项
// @namespace   Violentmonkey Scripts
// @match       *://www.aliyundrive.com/s/*
// @grant       none
// @version     XiaoYing_2023.06.02.1
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
// @require     https://greasyfork.org/scripts/465643-ajaxhookerlatest/code/ajaxHookerLatest.js
// @description Violentmonkey Scripts
// ==/UserScript==

function EndsWith(str, match) {
    if (str == null) return false;
    return str.substring(str.length - match.length) === match;
}

// eslint-disable-next-line no-undef
ajaxHooker.filter([{ type: 'xhr', url: 'api.aliyundrive.com', method: 'POST' }]);

// eslint-disable-next-line no-undef
ajaxHooker.hook((request) => {
    let url = request.url;
    if (!EndsWith(url, 'adrive/v2/file/list_by_share')) {
        return;
    }
    let data = JSON.parse(request.data);
    data.limit = 200;
    request.data = JSON.stringify(data);
});
