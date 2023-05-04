// ==UserScript==
// @name        ChatGPT Enhance
// @name:en     ChatGPT Enhance
// @name:zh-CN  ChatGPT 增强
// @name:zh-TW  ChatGPT 增強
// @name:ja     ChatGPT 拡張
// @name:ko     ChatGPT 향상
// @name:de     ChatGPT verbessern
// @name:fr     ChatGPT améliorer
// @name:es     ChatGPT mejorar
// @name:pt     ChatGPT melhorar
// @name:ru     ChatGPT улучшить
// @name:it     ChatGPT migliorare
// @name:tr     ChatGPT geliştirmek
// @name:ar     ChatGPT تحسين
// @name:th     ChatGPT ปรับปรุง
// @name:vi     ChatGPT cải thiện
// @name:id     ChatGPT meningkatkan
// @namespace   Violentmonkey Scripts
// @match       *://chat.openai.com/*
// @grant       none
// @version     XiaoYing_2023.05.24
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
// @require     https://greasyfork.org/scripts/465512-google-translate-engine/code/GoogleTranslateEngine.js
// @description 宽度对话框 & 一键清空聊天记录 & 向GPT声明指定语言回复
// @description:en Wide dialog & Clear chat history & Declare specified language reply to GPT
// @description:zh-CN  宽度对话框 & 一键清空聊天记录 & 向GPT声明指定语言回复
// @description:zh-TW 寬度對話框 & 一鍵清空聊天記錄 & 向GPT聲明指定語言回復
// @description:ja 幅広いダイアログ & チャット履歴をクリア & 指定された言語でGPTに宣言する
// @description:ko 넓은 대화 상자 & 채팅 기록 지우기 & 지정된 언어로 GPT에 선언
// @description:de Breites Dialogfeld & Chatverlauf löschen & GPT in angegebener Sprache deklarieren
// @description:fr Boîte de dialogue large & Effacer l'historique du chat & Déclarer la réponse dans la langue spécifiée à GPT
// @description:es Cuadro de diálogo ancho & Borrar el historial del chat & Declarar respuesta en el idioma especificado a GPT
// @description:pt Caixa de diálogo ampla & Limpar o histórico do bate-papo & Declarar resposta no idioma especificado ao GPT
// @description:ru Широкий диалоговое окно & Очистить историю чата & Объявить ответ на указанном языке в GPT
// @description:it Ampia finestra di dialogo & Cancella la cronologia della chat & Dichiarare la risposta nella lingua specificata a GPT
// @description:tr Geniş diyalog & Sohbet geçmişini temizle & GPT'ye belirtilen dilde yanıt bildir
// @description:ar مربع حوار واسع & مسح سجل المحادثة & إعلان الرد باللغة المحددة إلى GPT
// @description:th กล่องโต้ตอบกว้าง & ล้างประวัติการแชท & ประกาศการตอบกลับในภาษาที่ระบุไว้กับ GPT
// @description:vi Hộp thoại rộng & Xóa lịch sử trò chuyện & Khai báo trả lời bằng ngôn ngữ được chỉ định cho GPT
// @description:id Kotak dialog lebar & Hapus riwayat obrolan & Nyatakan balasan dalam bahasa yang ditentukan ke GPT
// ==/UserScript==

var global_module = window['global_module'];
var globalVariable = new Map();
var browserLanguage = navigator.language;
var hookRequest = unsafeWindow['__hookRequest__'];

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
    let Token = globalVariable.get('accessToken');
    if (Token == null) {
        alert('Token is null, please refresh the page and try again.Maybe the execution timing of the oil monkey script is set incorrectly.Please set to `document-start`!');
        return;
    }
    let headers = {
        Authorization: 'Bearer ' + Token,
        'Content-Type': 'application/json'
    };
    let body = { is_visible: false };
    (async () => {
        let NewChatHistoryElement = globalVariable.get('NewChatHistoryElement');
        let rHElement = globalVariable.get('rH');
        if (rHElement && $(NewChatHistoryElement).find(rHElement).length > 0) {
            return;
        }
        let lis = $(NewChatHistoryElement).find('ol').eq(0).find('li');
        if (lis.length === 0) {
            return;
        }
        $(NewChatHistoryElement).find('ol').eq(0).find('li').hide();
        let f = await hookRequest.globalVariable.get('Fetch')(url, { method, headers, body: JSON.stringify(body) });
        await f.json();
        global_module.clickElement(globalVariable.get('NewChatElement')[0]);
    })();
}

function createButtonOrShow(id = null, Show = null) {
    if (!id) {
        return;
    }
    if (document.getElementById(id) != null) {
        if (Show != null) document.getElementById(id).style.display = Show;
        return;
    }
    let border = document.querySelectorAll('div[class^="border-"]');
    border = border[border.length - 1];
    let div = document.createElement('div');
    div.id = id;
    let className = border.childNodes[0].className;
    div.className = className;
    border.insertBefore(div, border.childNodes[0]);
    return div;
}

async function getbrowserLanguageStr(text) {
    return new Promise(async (resolve) => {
        let r = await globalVariable.get('TranslateMachine').Translate(text, 'auto', browserLanguage, true);
        resolve(r.result);
    });
}

function createOrShowClearButton(Show = null) {
    let div = createButtonOrShow('_clearButton_', Show);
    (async () => {
        div.innerHTML = globalVariable.get('clearSvg')[0] + (await getbrowserLanguageStr('Clear Conversations'));
    })();
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
        (async () => {
            div.innerHTML = globalVariable.get('clearSvg')[div.name] + (await getbrowserLanguageStr(title));
        })();
    });
}

function addTextBase() {
    let style = $('body').find('style[id="text-base"]').eq(0);
    if (style.length != 0) {
        return;
    }
    style = document.createElement('style');
    style.id = 'text-base';
    let css = `.text-base {
        max-width: 92%;
    }`;
    style.innerHTML = css;
    document.body.appendChild(style);
}

async function initUseElement() {
    if (globalVariable.get('NewChatHistoryElement') != null) {
        return;
    }
    let ChatHistoryElement = $('div[class*="items-center"][class*="text"]').eq(0);
    globalVariable.set('NewChatHistoryElement', ChatHistoryElement);
    let newChat = ChatHistoryElement.parent().prev().prev().eq(0);
    if (newChat.length != 0 && newChat[0].tagName !== 'A') {
        newChat = newChat.find('a').eq(0);
    }
    newChat = newChat.eq(0);
    globalVariable.set('NewChatElement', newChat);
    await InitSvg();
    createOrShowClearButton();
    // configButton();
}

(async () => {
    // eslint-disable-next-line no-undef
    globalVariable.set('TranslateMachine', new TranslateMachine());
    hookRequest.FetchCallback.add('/api/auth/session', (_object, period) => {
        if (period !== 'done') {
            return;
        }
        addTextBase();
        let json = JSON.parse(_object.text);
        let accessToken = json.accessToken;
        localStorage.setItem('ChatGPT.accessToken', accessToken);
        globalVariable.set('accessToken', accessToken);
    });
    hookRequest.FetchCallback.add('/backend-api/conversation', (_object, period) => {
        if (period === 'done') {
            return;
        }
        let method = _object.args[1].method;
        if (method != 'POST') {
            return;
        }
        let additional = 'Please reply me with ' + browserLanguage;
        let body = JSON.parse(_object.args[1].body);
        let messages = body.messages;
        if (messages instanceof Array) {
            for (let i = 0; i < messages.length; i++) {
                let parts = messages[i].content.parts;
                if (parts instanceof Array) {
                    for (let j = 0; j < parts.length; j++) {
                        if (parts[j].indexOf('additional') != -1) {
                            continue;
                        }
                        parts[j] = parts[j] + '\n' + additional;
                    }
                }
            }
        }
        _object.args[1].body = JSON.stringify(body);
        setTimeout(() => {
            addTextBase();
        }, 100);
    });
    hookRequest.FetchCallback.add('/backend-api/conversations', (_object, period) => {
        if (period !== 'done') {
            return;
        }
        addTextBase();
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
                let rH = await global_module.waitForElement('div:contains("' + title + '")[class*="text-ellipsis"]', null, null, 10, -1);
                rH = rH.eq(0);
                rH.parent().hide();
                globalVariable.set('rH', rH);
            })();
        }
        initUseElement();
        _object.text = JSON.stringify(json);
        return _object;
    });
})();