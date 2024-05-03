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
// @match       *://chatgpt.com/*
// @version     XiaoYing_2024.05.03.1
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

// eslint-disable-next-line no-undef
ajaxHooker.protect();

var globalVariable = new Map();
var browserLanguage = navigator.language;
var ignoreHookStr = '&ignoreHookStr';

async function InitSvg() {
    return new Promise(async (resolve) => {
        let Svg = GM_getValue('clearSvg', []);
        let _class = GM_getValue('clearButtonClass', '');
        if (Svg.length !== 0 && _class !== '') {
            globalVariable.set('clearSvg', Svg);
            globalVariable.set('clearButtonClass', _class);
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
        _class = menuitem.className;
        globalVariable.set('clearButtonClass', _class);
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
            GM_setValue('clearButtonClass', _class);
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
        let hide = function (tryOne) {
            $(NewChatHistoryElement).parents('nav').find('ol').eq(0).find('li[class]').hide();
            if (tryOne) {
                setTimeout(() => {
                    hide(false);
                }, 1000);
            }
        };
        hide(true);
        conversationsToTrashCan();
        setTimeout(() => {
            hide(true);
        }, 1000);
        global_module.clickElement(globalVariable.get('NewChatElement')[0]);
        url = global_module.SetUrlParm(url, 'ignoreHookStr', '0');
        fetch(url + ignoreHookStr, { method, headers, body: JSON.stringify(body) });
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
    let border = document.querySelectorAll('div[class="grow"]');
    border = border[0];
    let div = document.createElement('div');
    div.id = id;
    let className = border.childNodes[0].className;
    div.className = className;
    border.insertBefore(div, border.childNodes[0]);
    return div;
}

async function getbrowserLanguageStr(text) {
    return new Promise(async (resolve) => {
        let cache = localStorage.getItem(text + '_' + browserLanguage);
        if (cache) {
            resolve(cache);
            return;
        }
        cache = (await globalVariable.get('TranslateMachine').Translate(text, 'auto', browserLanguage, true)).result;
        if (cache) {
            resolve(cache);
            localStorage.setItem(text + '_' + browserLanguage, cache);
            return;
        }
        resolve(cache);
    });
}

function conversationsToTrashCan() {
    let conversations = globalVariable.get('cacheConversations');
    conversations.forEach((value, key) => {
        globalVariable.get('trashCanConversations').set(key, '');
    });
    globalVariable.set('cacheConversations', new Map());
}

function createOrShowClearButton(Show = null) {
    let div = createButtonOrShow('_clearButton_', Show);
    if (!div) {
        return;
    }
    (async () => {
        div.innerHTML = globalVariable.get('clearSvg')[0] + (await getbrowserLanguageStr('Clear Conversations'));
    })();
    div.name = 0;
    div.className = globalVariable.get('clearButtonClass') || '';
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
    let ChatHistoryElement = $('div[class*="items-center"][class*="text"]').eq(0);
    globalVariable.set('NewChatHistoryElement', ChatHistoryElement);
    let newChat = ChatHistoryElement.parents('nav').eq(0).find('a').eq(0);
    if (newChat.length === 0) {
        setTimeout(() => {
            initUseElement();
        }, 1000);
        return;
    }
    newChat = newChat.eq(0);
    globalVariable.set('NewChatElement', newChat);
    await InitSvg();
    createOrShowClearButton();
}

function getContentMainBodyHistoricalDialogue(req, res, Text, period) {
    if (period !== 'done') {
        return;
    }
    setTimeout(() => {
        initUseElement();
    }, 1000);
}

globalVariable.set('cacheConversations', new Map());
globalVariable.set('trashCanConversations', new Map());

var HookFun = new Map();
HookFun.set('/api/auth/session', function (req, res, Text, period) {
    if (period === 'preload') {
        return;
    }
    new Promise(async (resolve) => {
        if (period !== 'done') {
            return;
        }
        addTextBase();
        let json = JSON.parse(Text);
        let accessToken = json.accessToken;
        localStorage.setItem('ChatGPT.accessToken', accessToken);
        globalVariable.set('accessToken', accessToken);
        resolve(null);
    });
});
HookFun.set('/backend-api/conversation', function (req, res, Text, period) {
    if (period === 'preload') {
        let additional = 'Please reply me with ';
        let additionals = additional + browserLanguage;
        let body = JSON.parse(req.data);
        let messages = body.messages;
        if (messages instanceof Array) {
            for (let i = 0; i < messages.length; i++) {
                let parts = messages[i].content.parts;
                if (parts instanceof Array) {
                    for (let j = 0; j < parts.length; j++) {
                        if (parts[j].indexOf(additional) != -1) {
                            continue;
                        }
                        parts[j] = parts[j] + '\n' + additionals;
                    }
                }
            }
        }
        req.data = JSON.stringify(body);
        setTimeout(() => {
            addTextBase();
        }, 100);
        return;
    }
    return new Promise(async (resolve) => {
        if (period !== 'done') {
            return;
        }
        resolve(null);
    });
});
HookFun.set('/backend-api/conversations', function (req, res, Text, period) {
    if (period === 'preload') {
        return;
    }
    return new Promise(async (resolve) => {
        if (period !== 'done') {
            return;
        }
        addTextBase();
        let url = req.url;
        if (url.indexOf('?') == -1) {
            return;
        }
        let json = JSON.parse(Text);
        if (json.items.length !== 0) {
            let i = 0;
            while (i != json.items.length) {
                let id = json.items[i].id;
                if (globalVariable.get('trashCanConversations').has(id)) {
                    json.items.splice(i, 1);
                    json.total--;
                    continue;
                }
                if (globalVariable.get('cacheConversations').has(id)) {
                    i++;
                    continue;
                }
                HookFun.set('/backend-api/conversation/' + id, getContentMainBodyHistoricalDialogue);
                globalVariable.get('cacheConversations').set(id, json.items[i]);
                i++;
            }
        }
        if (json.items.length === 0) {
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
        Text = JSON.stringify(json);
        resolve(Text);
    });
});

function handleResponse(request) {
    if (!request) {
        return;
    }
    if (request.url.indexOf(ignoreHookStr) != -1) {
        return;
    }
    let tempUrl = request.url;
    if (tempUrl.indexOf('http') == -1 && tempUrl[0] == '/') {
        tempUrl = location.origin + tempUrl;
    }
    let pathname = new URL(tempUrl).pathname;
    let fun = HookFun.get(pathname);
    if (!fun) {
        return;
    }
    fun(request, null, null, 'preload');
    request.response = (res) => {
        let Type = 0;
        let responseText = res.responseText;
        if (typeof responseText !== 'string') {
            Type = 1;
            responseText = res.text;
        }
        if (typeof responseText !== 'string') {
            Type = 2;
            responseText = JSON.stringify(res.json);
        }
        const oldText = responseText;
        res.responseText = new Promise(async (resolve) => {
            let ret = await fun(request, res, responseText, 'done');
            if (!ret) {
                ret = oldText;
            }
            if (Type === 2) {
                if (typeof ret === 'string') {
                    ret = JSON.parse(ret);
                }
            }
            resolve(ret);
        });
    };
}

// eslint-disable-next-line no-undef
ajaxHooker.hook(handleResponse);
// eslint-disable-next-line no-undef
globalVariable.set('TranslateMachine', new TranslateMachine());
