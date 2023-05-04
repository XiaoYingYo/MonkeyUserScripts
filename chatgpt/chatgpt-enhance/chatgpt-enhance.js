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
// @require     https://greasyfork.org/scripts/465508-translatelanguage/code/translateLanguage.js
// @description 宽度对话框 & 一键清空聊天记录 & 向GPT声明指定语言回复 & 界面控件翻译
// @description:en Wide dialog & Clear chat history & Declare specified language reply to GPT & Interface control translation
// @description:zh-CN  宽度对话框 & 一键清空聊天记录 & 向GPT声明指定语言回复 & 界面控件翻译
// @description:zh-TW 寬度對話框 & 一鍵清空聊天記錄 & 向GPT聲明指定語言回復 & 界面控件翻譯
// @description:ja 幅広いダイアログ & チャット履歴をクリア & 指定された言語でGPTに宣言する & インターフェースコントロールの翻訳
// @description:ko 넓은 대화 상자 & 채팅 기록 지우기 & 지정된 언어로 GPT에 선언 & 인터페이스 컨트롤 번역
// @description:de Breites Dialogfeld & Chatverlauf löschen & GPT in angegebener Sprache deklarieren & Übersetzung der Schnittstellensteuerung
// @description:fr Boîte de dialogue large & Effacer l'historique du chat & Déclarer la réponse dans la langue spécifiée à GPT & Traduction du contrôle de l'interface
// @description:es Cuadro de diálogo ancho & Borrar el historial del chat & Declarar respuesta en el idioma especificado a GPT & Traducción del control de la interfaz
// @description:pt Caixa de diálogo ampla & Limpar o histórico do bate-papo & Declarar resposta no idioma especificado ao GPT & Tradução do controle da interface
// @description:ru Широкий диалоговое окно & Очистить историю чата & Объявить ответ на указанном языке в GPT & Перевод элемента управления интерфейсом
// @description:it Ampia finestra di dialogo & Cancella la cronologia della chat & Dichiarare la risposta nella lingua specificata a GPT & Traduzione del controllo dell'interfaccia
// @description:tr Geniş diyalog & Sohbet geçmişini temizle & GPT'ye belirtilen dilde yanıt bildir & Arayüz kontrolünün çevirisi
// @description:ar مربع حوار واسع & مسح سجل المحادثة & إعلان الرد باللغة المحددة إلى GPT & ترجمة تحكم الواجهة
// @description:th กล่องโต้ตอบกว้าง & ล้างประวัติการแชท & ประกาศการตอบกลับในภาษาที่ระบุไว้กับ GPT & การแปลควบคุมอินเตอร์เฟซ
// @description:vi Hộp thoại rộng & Xóa lịch sử trò chuyện & Khai báo trả lời bằng ngôn ngữ được chỉ định cho GPT & Dịch điều khiển giao diện
// @description:id Kotak dialog lebar & Hapus riwayat obrolan & Nyatakan balasan dalam bahasa yang ditentukan ke GPT & Terjemahan kontrol antarmuka
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
        alert('Token is null, please refresh the page and try again.');
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

function createOrShowClearButton(Show = null) {
    let div = createButtonOrShow('_clearButton_', Show);
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
}

// function openDialog(title = '') {
//     if (document.getElementById('_Dialog_') != null) {
//         document.getElementById('_Dialog_').remove();
//     }
//     let html = `<div class="relative z-50" id="headlessui-dialog-:r2:" role="dialog" aria-modal="true" data-headlessui-state="open"><div class="fixed inset-0 bg-gray-500/90 transition-opacity dark:bg-gray-800/90"></div><div class="fixed inset-0 z-50 overflow-y-auto"><div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"><div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-900 sm:my-8 sm:w-full sm:max-w-lg px-4 pb-4 pt-5 sm:p-6" id="headlessui-dialog-panel-:r3:" data-headlessui-state="open">${title}<div class="flex items-center justify-between" style='display:flex;justify-content: flex-end;'><div id='X' style='cursor:pointer;'>X</div><div class="flex items-center"><div class="text-center sm:text-left"></div></div><div></div></div><div id='C' class="prose dark:prose-invert"></div></div></div></div></div>`;
//     let div = document.createElement('div');
//     div.id = '_dialog_';
//     div.innerHTML = html;
//     document.body.appendChild(div);
//     $(div)
//         .find('#X')
//         .eq(0)
//         .click(() => {
//             div.remove();
//         });
//     return $(div).find('#C').eq(0);
// }

// function addconfigOptions(div, op = {}) {
//     if (!div || op == {}) {
//         return;
//     }
// }

// function configButton(Show = null) {
//     let div = createButtonOrShow('_configButton_', Show);
//     let svg = '<svg t="1683204209602" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3482" width="20" height="20"><path d="M82.448516 373.000258l3.534452 5.020903a230.135742 230.135742 0 0 1 0 277.900387 97.313032 97.313032 0 0 0 87.898838 155.515871l6.672517-0.726709a229.243871 229.243871 0 0 1 235.751225 139.396129 97.213935 97.213935 0 0 0 177.845678 3.336258l3.501419-7.531355a234.727226 234.727226 0 0 1 238.88929-134.639484 97.775484 97.775484 0 0 0 94.075871-148.513032l-4.294193-6.408258a241.465806 241.465806 0 0 1-5.384258-270.864516l6.276129-9.149936a97.775484 97.775484 0 0 0-84.925936-154.128516l-5.747613 0.462452a229.904516 229.904516 0 0 1-231.985548-127.70271l-5.219097-11.429161a97.874581 97.874581 0 0 0-176.590451-5.384258l-2.543484 5.384258a236.180645 236.180645 0 0 1-241.135484 139.528258l-5.186065-0.561549a97.313032 97.313032 0 0 0-91.43329 150.494968z m42.314323-104.976516a64.280774 64.280774 0 0 1 45.617548-12.651355l5.219097 0.561548a269.212903 269.212903 0 0 0 274.828387-159.083354 64.842323 64.842323 0 0 1 118.684903 0l1.486452 3.435354a262.936774 262.936774 0 0 0 269.60929 155.251613 64.743226 64.743226 0 0 1 60.019613 101.739355l-0.891871 1.255226a274.498065 274.498065 0 0 0-5.747613 308.422194l6.639484 9.711483a64.743226 64.743226 0 0 1-60.019613 101.739355 267.759484 267.759484 0 0 0-272.516129 153.6l-3.501419 7.564387a64.181677 64.181677 0 0 1-117.429678-2.180129 262.276129 262.276129 0 0 0-260.855742-160.305548l-15.525161 1.486452a64.280774 64.280774 0 0 1-58.037677-102.730323 263.168 263.168 0 0 0 0-317.770323 64.280774 64.280774 0 0 1 12.420129-90.045935z" fill="#0072FF" p-id="3483"></path><path d="M518.342194 346.310194a162.386581 162.386581 0 1 0 0 324.773161 162.386581 162.386581 0 0 0 0-324.773161z m0 33.032258a129.354323 129.354323 0 1 1 0 258.708645 129.354323 129.354323 0 0 1 0-258.708645z" fill="#0072FF" p-id="3484"></path></svg>';
//     div.innerHTML = svg + 'Config';
//     div.addEventListener('click', () => {
//         let div = openDialog();
//         addconfigOptions(div, {
//             title: 'Response Language',
//             extraData: window['_translateLanguage_'],
//             components: 'select'
//         });
//     });
// }

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
    if (newChat[0].tagName !== 'A') {
        newChat = newChat.find('a').eq(0);
    }
    newChat = newChat.eq(0);
    globalVariable.set('NewChatElement', newChat);
    await InitSvg();
    createOrShowClearButton();
    // configButton();
}

(async () => {
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
        let additional = 'If I use `' + browserLanguage + '` to communicate with you, then please also use `' + browserLanguage + '` to reply me';
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
