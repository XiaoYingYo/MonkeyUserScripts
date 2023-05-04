// ==UserScript==
// @name        Clear Chat History
// @name:en     Clear Chat History
// @name:zh-CN  清空历史聊天记录
// @name:zh-TW  清空聊天記錄
// @name:ja     チャット履歴をクリア
// @name:ko     채팅 기록 지우기
// @name:de     Chatverlauf löschen
// @name:fr     Effacer l'historique de discussion
// @name:es     Borrar el historial de chat
// @name:pt     Limpar histórico de conversa
// @name:ru     Очистить историю чата
// @name:it     Cancella la cronologia della chat
// @name:tr      Sohbet Geçmişini Temizle
// @name:ar     مسح سجل الدردشة
// @name:th     ล้างประวัติการสนทนา
// @name:vi     Xóa lịch sử trò chuyện
// @name:id     Hapus Riwayat Obrolan
// @namespace   Violentmonkey Scripts
// @match       *://chat.openai.com/*
// @grant       none
// @version     XiaoYing_2023.05.20
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
// @require     https://greasyfork.org/scripts/465483-hookrequestandfetch/code/hookRequestAndFetch.js
// @description Violentmonkey Scripts
// @description:en Violentmonkey Scripts
// @description:zh-CN Violentmonkey 脚本
// @description:zh-TW Violentmonkey 腳本
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

var global_module = window['global_module'];
var globalVariable = new Map();

async function InitSvg() {
    return new Promise(async (resolve) => {
        let Svg = GM_getValue('clearSvg', []);
        if (Svg.length !== 0) {
            globalVariable.set('clearSvg', Svg);
            resolve(true);
            return;
        }
        let menuButton = document.querySelector('button[id^="headlessui-menu-button-"]');
        menuButton.click();
        let menuitems = [];
        await new Promise((resolve) => {
            let Timer = setInterval(() => {
                menuitems = document.querySelectorAll('a[role="menuitem"]');
                if (menuitems.length < 4) {
                    return;
                }
                clearInterval(Timer);
                resolve();
            }, 100);
        });
        let menuitem = menuitems[1];
        if (menuitem.name === 1) {
            return;
        }
        let svg = menuitem.querySelector('svg');
        globalVariable.set('clearSvg', []);
        globalVariable.get('clearSvg').push(svg.outerHTML);
        menuitem.click();
        setTimeout(() => {
            svg = menuitem.querySelector('svg');
            globalVariable.get('clearSvg').push(svg.outerHTML);
            menuitem.name = 1;
            menuitem.remove();
            menuButton.click();
            GM_setValue('clearSvg', globalVariable.get('clearSvg'));
            resolve(true);
        }, 100);
    });
}

function clearChats() {
    let url = '/backend-api/conversations';
    let method = 'PATCH';
    let headers = {
        Authorization: 'Bearer ' + globalVariable.get('accessToken'),
        'Content-Type': 'application/json'
    };
    let body = { is_visible: false };
    (async () => {
        await globalVariable.get('Fetch')(url, { method, headers, body: JSON.stringify(body) });
    })();
}

function createOrShowClearButton(Show = null) {
    if (document.getElementById('_clearButton_') != null) {
        if (Show != null) document.getElementById('_clearButton_').style.display = Show;
        return;
    }
    let border = document.querySelectorAll('div[class^="border-"]');
    border = border[border.length - 1];
    let div = document.createElement('div');
    div.id = '_clearButton_';
    let className = border.childNodes[0].className;
    div.className = className;
    border.insertBefore(div, border.childNodes[0]);
    (async function () {
        if (globalVariable.get('clearSvg') == null) {
            if (!(await InitSvg())) {
                return;
            }
        }
        div.innerHTML = globalVariable.get('clearSvg')[0] + 'Clear Conversations';
        div.name = 0;
        div.addEventListener('click', function () {
            let title = 'Clear Conversations';
            if (div.name === 0) {
                title = 'Confirm ' + title;
                div.name = 1;
            } else {
                div.name = 0;
                clearChats();
            }
            div.innerHTML = globalVariable.get('clearSvg')[div.name] + title;
        });
    })();
}

(async () => {
    unsafeWindow['__hookRequest__'].FetchCallback.add('/api/auth/session', (_object, period) => {
        if (period !== 'done') {
            return;
        }
        let json = JSON.parse(_object.text);
        let accessToken = json.accessToken;
        localStorage.setItem('ChatGPT.accessToken', accessToken);
        globalVariable.set('accessToken', accessToken);
    });
    unsafeWindow['__hookRequest__'].FetchCallback.add('/backend-api/conversations', (_object, period) => {
        if (period !== 'done') {
            return;
        }
        let url = _object.args[0];
        if (url.indexOf('?') == -1) {
            return;
        }
        let json = JSON.parse(_object.text);
        if (json.total === 0) {
            let title = '{_reserveHistory_}';
            json.total = 0;
            let time = new Date().toISOString();
            json.items = [{ id: '', title, create_time: time, update_time: time }];
            (async () => {
                let rH = await global_module.waitForElement('div:contains("' + title + '")[class*="text-ellipsis"]', null, null, 100, -1);
                rH = rH.eq(0);
                rH.parent().hide();
                await InitSvg();
                createOrShowClearButton();
            })();
        }
        _object.text = JSON.stringify(json);
        return _object;
    });
    let newChat = await global_module.waitForElement('a[class*="items-center"]');
    newChat = newChat.eq(0);
    globalVariable.set('NewChatElement', newChat);
    let chatHistoryElement = newChat.next().next();
    globalVariable.set('NewChatHistoryElement', chatHistoryElement);
})();
