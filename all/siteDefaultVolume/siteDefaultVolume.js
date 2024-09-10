// ==UserScript==
// @name         站点默认媒体音量
// @name:en      Site Default Media Volume
// @name:zh-CN   站点默认媒体音量
// @name:zh-TW   站點預設媒體音量
// @name:ja      サイトデフォルトのメディアボリューム
// @name:ko      사이트 기본 미디어 볼륨
// @name:de      Standard-Medienlautstärke der Website
// @name:fr      Volume par défaut des médias du site
// @name:es      Volumen de medios predeterminado del sitio
// @name:pt      Volume padrão de mídia do site
// @name:ru      Стандартная громкость медиа на сайте
// @name:it      Volume predefinito dei media del sito
// @name:tr      Site Varsayılan Medya Ses Seviyesi
// @name:ar      حجم الوسائط الافتراضي للموقع
// @name:th      ระดับเสียงสื่อเริ่มต้นของเว็บไซต์
// @name:vi      Âm lượng phương tiện mặc định của trang web
// @name:id      Volume Media Default Situs
// @namespace    Violentmonkey Scripts
// @match       *://*/*
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
// @description 暴力猴脚本
// @description:en Violentmonkey Scripts
// @description:zh-CN 暴力猴脚本
// @description:zh-TW 暴力猴腳本
// @description:ja Violentmonkey スクリプト
// @description:ko Violentmonkey 스크립트
// @description:de Violentmonkey Skripte
// @description:fr Violentmonkey Scripts
// @description:es Violentmonkey Scripts
// @description:pt Violentmonkey Scripts
// @description:ru Violentmonkey Сценарии
// @description:it Violentmonkey Scripts
// @description:tr Violentmonkey Scripts
// @description:ar Violentmonkey Scripts
// @description:th Violentmonkey Scripts
// @description:vi Violentmonkey Scripts
// @description:id Violentmonkey Scripts
// ==/UserScript==

var host = location.host;
var global_module = window['global_module'];

var extraPreFun = {
    'www.youtube.com': function (obj) {
        let data = {
            data: '{"volume":' + obj.volume * 100 + ',"muted":false}',
            expiration: Date.now(),
            creation: Date.now()
        };
        localStorage.setItem('yt-player-volume', JSON.stringify(data));
    }
};

async function main() {
    let defaultVolume = GM_getValue(host, null);
    if (defaultVolume == null) {
        return;
    }
    defaultVolume = parseFloat(defaultVolume);
    if (extraPreFun[host]) {
        await extraPreFun[host]({ volume: defaultVolume });
    }
    await global_module.waitForElement('body', null, null, 200, -1);
    function setVolume(mediaElement) {
        return new Promise((resolve) => {
            $(mediaElement).one('playing', async () => {
                mediaElement.volume = defaultVolume;
                mediaElement.dispatchEvent(new Event('volumechange'));
                resolve();
            });
        });
    }
    function observeExistingMedia() {
        document.querySelectorAll('audio, video').forEach((mediaElement) => {
            setVolume(mediaElement);
            $(mediaElement).one('play', function () {
                setVolume(mediaElement);
            });
        });
    }
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.tagName === 'AUDIO' || node.tagName === 'VIDEO') {
                    setVolume(node);
                    $(node).one('play', function () {
                        setVolume(node);
                    });
                }
            });
        });
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    observeExistingMedia();
}
GM_registerMenuCommand('setDefaultVolume', function () {
    let value = window.prompt('Enter new default volume', parseInt(GM_getValue(host, '0') * 100));
    if (value) {
        GM_setValue(host, parseFloat(parseInt(value) / 100).toString());
    }
});
GM_registerMenuCommand('removeDefaultVolume', function () {
    GM_deleteValue(host);
});
main();
