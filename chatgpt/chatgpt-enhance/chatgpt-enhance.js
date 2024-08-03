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
// @version     XiaoYing_2024.08.04.11
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
// @require     https://greasyfork.org/scripts/440334-jquery-like-spa-operation-library/code/jQuery-like%20SPA%20operation%20library.js
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
var clearButtonSvg = '<svg t="1722633865116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1793" width="24" height="24"><path d="M901.3 504.8l-76.3-150c-13.4-26.3-40-42.6-69.5-42.6H639c-1.1 0-2-0.9-2-2V120.6c0-31.1-25.3-56.3-56.3-56.3h-90c-31.1 0-56.3 25.3-56.3 56.3v189.6c0 1.1-0.9 2-2 2H315.8c-29.5 0-56.1 16.3-69.5 42.6l-76.3 150c-9.2 18.1-8.4 39.3 2.2 56.6 10.3 16.8 27.9 27 47.4 27.6-4.8 101-38.3 205.9-90.2 279.5-12.5 17.8-14.1 40.8-4.1 60.1 10 19.3 29.7 31.3 51.5 31.3h601.5c35 0 66-23.6 75.2-57.4 15.5-56.5 28.4-107.9 29.4-164.9C884 685 874 636 852.9 589c19-1.1 36.1-11.2 46.2-27.6 10.6-17.3 11.4-38.5 2.2-56.6z m-681.4 25.4l76.3-150c3.8-7.4 11.3-12 19.6-12h116.4c32 0 58-26 58-58V120.6c0-0.1 0.2-0.3 0.3-0.3h90c0.1 0 0.3 0.2 0.3 0.3v189.6c0 32 26 58 58 58h116.4c8.3 0 15.8 4.6 19.6 12l76.3 150c0.2 0.3 0.5 1-0.1 2s-1.3 1-1.7 1H221.7c-0.4 0-1.1 0-1.7-1-0.6-1-0.3-1.7-0.1-2zM827 736.6c-0.9 50.5-12.9 98.3-27.4 151.1-2.6 9.5-11.3 16.2-21.2 16.2H651.8c11.3-22.3 18.5-44 23.1-61.2 7.1-26.7 10.7-53.5 10.6-78-0.1-17.1-15.5-30.1-32.4-27.4-13.6 2.2-23.6 14-23.6 27.8 0.1 42.7-14.1 98.2-42.7 138.8H406.2c15.2-21.7 26.1-43.8 33.6-61.9 10-24.3 17.4-49.7 21.2-72.5 2.8-17-10.4-32.5-27.6-32.5-13.6 0-25.3 9.8-27.6 23.3-2.8 16.6-8.3 37.7-17.7 60.4-10.1 24.6-27.8 58.1-55.6 83.3H176.9c-0.5 0-1.2 0-1.8-1.1-0.6-1.1-0.2-1.6 0.1-2 29.7-42.1 54.8-94.5 72.5-151.4 16.2-52.1 25.7-106.9 28-160.3h514.6C816 635.6 828 684 827 736.6z" fill="#ffffff" p-id="1794"></path></svg>';

(async function () {
    function initSession() {
        return new Promise((resolve) => {
            $.get('/api/auth/session', { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } }).done((res) => {
                globalVariable.set('session', res);
                globalVariable.set('accessToken', res.accessToken);
                resolve();
            });
        });
    }

    function clearAllConversations() {
        return new Promise(async (resolve) => {
            let data = await getAllItems();
            let Tasks = [];
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                let id = item.id;
                let title = item.title;
                if (title.charAt(0) == '#') {
                    continue;
                }
                Tasks.push(deleteItem(id));
            }
            await Promise.all(Tasks);
            resolve();
            // $.ajax({
            //     type: 'PATCH',
            //     url: '/backend-api/conversations',
            //     headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${globalVariable.get('accessToken')}` },
            //     data: JSON.stringify({ is_visible: false }),
            //     success: (res) => {
            //         resolve(res);
            //     }
            // });
        });
    }

    function initClearButton() {
        return new Promise(async (resolve) => {
            let sureClearButtonSvg = '<svg t="1722633889519" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3987" width="24" height="24"><path d="M675.328 117.717333A425.429333 425.429333 0 0 0 512 85.333333C276.352 85.333333 85.333333 276.352 85.333333 512s191.018667 426.666667 426.666667 426.666667 426.666667-191.018667 426.666667-426.666667c0-56.746667-11.093333-112-32.384-163.328a21.333333 21.333333 0 0 0-39.402667 16.341333A382.762667 382.762667 0 0 1 896 512c0 212.074667-171.925333 384-384 384S128 724.074667 128 512 299.925333 128 512 128c51.114667 0 100.8 9.984 146.986667 29.12a21.333333 21.333333 0 0 0 16.341333-39.402667z m-213.333333 468.608l-105.664-105.642666a21.248 21.248 0 0 0-30.122667 0.042666c-8.32 8.32-8.213333 21.973333-0.064 30.101334l120.810667 120.832a21.248 21.248 0 0 0 30.122666-0.085334l211.157334-211.157333a21.290667 21.290667 0 0 0 0-30.186667 21.397333 21.397333 0 0 0-30.250667 0.106667l-196.010667 195.989333z" fill="#ffffff" p-id="3988"></path></svg>';
            let oneBtn = await global_module.waitForElement('nav[aria-label]', null, null, 100, -1);
            globalVariable.set('Nav', $(oneBtn));
            oneBtn = oneBtn.find('button').eq(0);
            let newBtn = global_module.cloneAndHide(oneBtn[0]);
            newBtn = $(newBtn).eq(0).attr('status', 0);
            oneBtn.show();
            newBtn.find('svg').remove();
            newBtn.append(clearButtonSvg);
            newBtn.off('click').on('click', async () => {
                let status = newBtn.attr('status');
                newBtn.attr('disabled', 'disabled');
                if (status == 0) {
                    newBtn.attr('status', 1);
                    newBtn.find('svg').remove();
                    newBtn.append(sureClearButtonSvg);
                } else {
                    newBtn.attr('status', 0);
                    newBtn.find('svg').remove();
                    newBtn.append(clearButtonSvg);
                    await clearAllConversations();
                    unsafeWindow.location.href = '/';
                }
                newBtn.removeAttr('disabled');
            });
            resolve();
        });
    }

    await initSession();
    initClearButton();
})();

function purify() {
    return new Promise(async (resolve) => {
        let Tasks = [];
        let nav = globalVariable.get('Nav');
        Tasks.push(
            (() => {
                return new Promise(async (resolve) => {
                    let upgradeDom = await global_module.waitForElement('span[class*="border-token-border-light"]', null, null, 100, -1, nav);
                    upgradeDom = upgradeDom.eq(upgradeDom.length - 1);
                    upgradeDom.parents('a').eq(0).remove();
                    resolve();
                });
            })()
        );
        Tasks.push(
            (() => {
                return new Promise(async (resolve) => {
                    let presentation = await global_module.waitForElement('div[role="presentation"]', null, null, 100, -1);
                    presentation = presentation.eq(presentation.length - 1);
                    let presentationTip = await global_module.waitForElement('span:contains("ChatGPT ")', null, null, 100, -1, presentation);
                    presentationTip.remove();
                    resolve();
                });
            })()
        );
        Tasks.push(
            (() => {
                return new Promise(async (resolve) => {
                    $(await global_module.waitForElement('button[data-state="closed"][id^="radix"]:contains("?")', null, null, 100, -1)).remove();
                    resolve();
                });
            })()
        );
        await Promise.all(Tasks);
        resolve();
    });
}

function getAllItems() {
    return new Promise(async (resolve) => {
        let limit = 30;
        let currentTotal = 0;
        let retItems = [];
        let getItems = function (offset) {
            return new Promise(async (resolve) => {
                console.log('getAllItems');
                $.ajax({
                    type: 'GET',
                    url: '/backend-api/conversations?offset=' + offset + '&limit=' + limit + '&order=updated',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${globalVariable.get('accessToken')}` },
                    success: (data) => {
                        resolve(data);
                    },
                    error: async () => {
                        resolve(await getAllItems(offset));
                    }
                });
            });
        };
        let data = await getItems(0);
        let total = data.total;
        let items = data.items;
        currentTotal = currentTotal + items.length;
        retItems = retItems.concat(items);
        while (currentTotal < total) {
            data = await getItems(currentTotal);
            total = data.total;
            items = data.items;
            currentTotal = currentTotal + items.length;
            retItems = retItems.concat(items);
        }
        resolve(retItems);
    });
}

function deleteItem(id) {
    return new Promise(async (resolve) => {
        globalVariable.get('itemDom')[id].hide();
        $.ajax({
            type: 'PATCH',
            url: '/backend-api/conversation/' + id,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${globalVariable.get('accessToken')}` },
            data: JSON.stringify({ is_visible: false }),
            success: () => {
                globalVariable.get('itemDom')[id].remove();
                resolve(true);
            },
            error: async () => {
                resolve(await deleteItem(id));
            }
        });
    });
}

function initItemDeleteBtn() {
    return new Promise(async (resolve) => {
        let nav = globalVariable.get('Nav');
        let itemDiv = await global_module.waitForElement('div[class*="text-token-text-primary text-sm"]', null, null, 100, -1, nav);
        let liList = await global_module.waitForElement('li', null, null, 100, -1, itemDiv);
        globalVariable.set('itemDom', {});
        for (let i = 0; i < liList.length; i++) {
            let spanBtn = $(liList[i]).find('span[class][data-state="closed"]');
            let that = spanBtn.eq(0);
            let li = that.parents('li');
            let a = li.find('a');
            let href = a.attr('href');
            let id = href.replace('/c/', '');
            globalVariable.get('itemDom')[id] = li;
            if (spanBtn.length != 1) {
                continue;
            }
            let newBtn = global_module.cloneAndHide(that[0], 2);
            newBtn = $(newBtn);
            newBtn.find('svg').remove();
            newBtn.append(clearButtonSvg);
            that.show();
            newBtn.css('cursor', 'pointer');
            newBtn.off('click').on('click', async () => {
                await deleteItem(id);
            });
        }
        resolve();
    });
}

function widescreenDialogue() {
    return new Promise(async (resolve) => {
        if ($('body').find('style[id="widescreenDialogueCss]').length != 0) {
            resolve();
            return;
        }
        let sel = 'textarea[id="prompt-textarea"]';
        let Btn = await global_module.waitForElement(sel, null, null, 1000, -1);
        Btn = Btn.eq(0);
        let BtnParent = Btn.parents('form').eq(0).parent().eq(0);
        let cssClassName = BtnParent.attr('class').split(' ')[0];
        let styleHtml = '.' + cssClassName + '{width:100%;max-width:100%;}';
        $('body').append('<style id="widescreenDialogueCss">' + styleHtml + '</style>');
        resolve();
    });
}

var HookFun = new Map();
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
        return;
    }
    return new Promise(async (resolve) => {
        if (period !== 'done') {
            resolve(null);
            return;
        }
        setTimeout(async () => {
            await widescreenDialogue();
        }, 100);
        resolve(null);
    });
});
HookFun.set('/backend-api/conversations', function (req, res, Text, period) {
    return new Promise(async (resolve) => {
        if (period !== 'done') {
            resolve(null);
            return;
        }
        setTimeout(async () => {
            await initItemDeleteBtn();
        }, 1000);
        resolve(null);
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

$.onurlchange(function () {
    setTimeout(async () => {
        await widescreenDialogue();
        await purify();
    }, 1000);
});
