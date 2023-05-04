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

(async () => { 
    unsafeWindow['__hookRequest__'].FetchCallback.add('/api/auth/session', (_object, period) => {
        if (period !== 'done') { 
            return;
        }
        let json = JSON.parse(_object.text);
        let accessToken = json.accessToken;
        localStorage.setItem('chatgpt.js.org.accessToken', accessToken);
        globalVariable.set('accessToken', accessToken);
    });
})();