// ==UserScript==
// @name        Pornhub 增强
// @namespace   Violentmonkey Scripts
// @match       *://www.pornhub.com/*
// @grant       none
// @version     XiaoYing_2024.12.13.3
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
// @description 暴力猴脚本
// ==/UserScript==

var global_module = window['global_module'];

var funMap = new Map();

funMap.set('/view_video.php', async () => {
    return new Promise(async (resolve) => {
        let abAlertClose = await global_module.waitForElement('a[id="abAlertClose"]', null, null, 100, -1);
        global_module.clickElement(abAlertClose.eq(0)[0]);
        let playerDiv = await global_module.waitForElement('div[id^="playerDiv"]', null, null, 100, -1);
        let loadMoreRelatedVideosCenter = await global_module.waitForElement('div[id="loadMoreRelatedVideosCenter"]', null, null, 100, -1);
        let loadMoreRelatedVideosCenterText = $(loadMoreRelatedVideosCenter).eq(0).text().trim();
        await new Promise((resolve) => {
            let timer = setInterval(() => {
                if (loadMoreRelatedVideosCenterText != $(loadMoreRelatedVideosCenter).eq(0).text().trim()) {
                    clearInterval(timer);
                    resolve();
                    return;
                }
                global_module.clickElement(loadMoreRelatedVideosCenter.eq(0)[0]);
            }, 500);
        });
        let recommendedLoadMore = await global_module.waitForElement('a[data-label="recommended_load_more"]', null, null, 100, -1);
        let recommendedLoadMoreLabel = $(recommendedLoadMore).eq(0).attr('data-label');
        await new Promise((resolve) => {
            let timer = setInterval(() => {
                if (recommendedLoadMoreLabel != $(recommendedLoadMore).eq(0).attr('data-label')) {
                    clearInterval(timer);
                    resolve();
                    return;
                }
                global_module.clickElement(recommendedLoadMore.eq(0)[0]);
            }, 500);
        });
        $('html, body').animate({
            scrollTop: playerDiv.offset().top
        });
        resolve();
    });
});

async function main() {
    let container = await global_module.waitForElement('div.container', null, null, 100, -1);
    container.css({
        'max-width': '100%',
        width: '100%'
    });
    let path = unsafeWindow.location.pathname;
    let fun = funMap.get(path);
    if (fun) {
        try {
            await fun();
        } catch (e) {}
    }
}

main();
