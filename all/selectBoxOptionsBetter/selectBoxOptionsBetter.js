// ==UserScript==
// @name         drop down select box options better user feeling or optimization
// @name:en      drop down select box options better user feeling or optimization
// @name:zh-CN  下拉选择框选项更好的用户体验或优化
// @name:zh-TW  下拉選單選項更好的使用者體驗或優化
// @name:ja     ユーザーエクスペリエンスや最適化を向上させるためのドロップダウン選択ボックスオプション
// @name:ko     다운로드 선택 상자 옵션을 개선하여 사용자 경험 또는 최적화
// @name:de     Verbesserte Benutzererfahrung oder Optimierung von Dropdown-Auswahlfeldoptionen
// @name:fr     Amélioration de l expérience utilisateur ou optimisation des options de la liste déroulante
// @name:es     Mejora de la experiencia del usuario u optimización de las opciones de la caja de selección desplegable
// @name:pt     Melhoria da experiência do usuário ou otimização das opções da caixa de seleção suspensa
// @name:ru     Улучшенный пользовательский опыт или оптимизация вариантов выпадающего списка
// @name:it     Miglioramento dell'esperienza utente o ottimizzazione delle opzioni della casella di selezione a discesa
// @name:tr     Aşağı açılır seçim kutusu seçeneklerinin kullanıcı deneyimini geliştirilmesi veya optimize edilmesi
// @name:ar     تحسين تجربة المستخدم أو تحسين خيارات مربع الاختيار القابل للسحب
// @name:th     การปรับปรุงประสบการณ์ของผู้ใช้หรือการปรับปรุงตัวเลือกกล่องเลือกแบบเลื่อนลง
// @name:vi     Cải thiện trải nghiệm người dùng hoặc tối ưu hóa tùy chọn hộp thả xuống
// @name:id     Peningkatan pengalaman pengguna atau optimasi opsi kotak pilihan dropdown
// @namespace   Violentmonkey Scripts
// @match        *://*/*
// @grant       none
// @version     XiaoYing_2023.07.18.3
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

var global_module = window['global_module'];
var globalVariable = new Map();

(async () => {
    function showModal() {
        let ModalDom = $(`<div id="_select_"><div id="_selectModal_grayMask_"></div><div id="_selectModal_">
            <input type="text" class="input-box">
            <div class="content">
                <div class="list">
                </div>
            </div>
        </div></div>`);
        globalVariable.set('ModalDom', ModalDom);
        $('body').append(ModalDom);
        ModalDom.find('.input-box').eq(0).focus();
        ModalDom.find('div[id="_selectModal_grayMask_"]').on('click', function () {
            closeModal();
        });
        return ModalDom;
    }

    function addOption(ModalDom, listDomOrStr = null) {
        if (!listDomOrStr) {
            return;
        }
        let listDom = ModalDom.find('div.list').eq(0);
        listDom.append(listDomOrStr);
        for (let i = 0; i < 100; i++) {
            listDom.append(listDomOrStr);
        }
    }

    function closeModal() {
        let modalDom = globalVariable.get('ModalDom');
        modalDom.remove();
        globalVariable.delete('ModalDom');
    }

    function initCss() {
        if (globalVariable.get('pageCss')) {
            return;
        }
        let css = `
            #_selectModal_grayMask_ {
                position: fixed;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 9999;
            }

            #_selectModal_ {
                position: fixed;
                width: 90%;
                height: 90%;
                background-color: White;
                top: 5%;
                left: 5%;
                z-index: 10000;
            }

            .input-box {
                width: 100%;
                height: 50px;
                box-sizing: border-box;
                padding: 10px;
                font-size: 16px;
                border-radius: 5px;
                border: 2px solid #3438b9;
                outline: none;
            }
            
            .content {
                height: calc(100% - 60px);
                overflow-y: auto;
            }
            
            .list li{
                list-style: none;
                text-align: center;
                border-radius: 5px;
                border: 1px solid #3438b9;
                line-height: 36px;
                margin-top: 8px;
                margin-right: 10px;
                margin-left: 10px;
                cursor: pointer;
            }
            
            @media screen and (min-width: 768px) {
                .list {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1px;
                }
            }
            @media screen and (max-width: 767px) {
                .list {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1px;
                }
            }
        `;
        globalVariable.set('pageCss', css);
        $('body').append('<style id="selectPageCss">' + css + '</style>');
    }

    globalVariable.set('selectSed', 0);

    function findSelect() {
        let select = $('select');
        for (let i = 0; i < select.length; i++) {
            let sed = parseInt(globalVariable.get('selectSed').toString());
            globalVariable.set('selectSed', sed + 1);
            let obj = select[i];
            obj.setAttribute('sed', sed);
            (async (that = obj) => {
                that.addEventListener('click', () => {
                    let ModalDom = showModal();
                    let listDomOrStr = '';
                    let options = that.options;
                    for (let i = 0; i < options.length; i++) {
                        listDomOrStr += `<li onclick="_selectModal_Click_(this,${sed});" index='${i}'>${options[i].innerHTML}</li>`;
                    }
                    addOption(ModalDom, listDomOrStr);
                    ModalDom.find('.input-box')
                        .eq(0)
                        .on(
                            'input',
                            global_module.debounce((e) => {
                                let val = e.target.value;
                                let ops = ModalDom.find('div.list').eq(0).find('li');
                                for (let i = 0; i < ops.length; i++) {
                                    let op = ops[i];
                                    if (val !== '') {
                                        if (op.innerHTML.indexOf(val) === -1) {
                                            op.style.display = 'none';
                                        } else {
                                            op.style.display = 'block';
                                        }
                                    } else {
                                        op.style.display = 'block';
                                    }
                                }
                            }, 200)
                        );
                    initCss();
                });
            })();
        }
    }

    function selectModalClick(that, sed) {
        closeModal();
        let index = that.getAttribute('index');
        index = parseInt(index);
        let select = $('select[sed=' + sed + ']').eq(0);
        select.prop('selectedIndex', index);
        select[0].focus();
        select[0].dispatchEvent(new Event('change'));
    }

    unsafeWindow['_selectModal_Click_'] = selectModalClick;

    function main() {
        findSelect();
    }

    $(document).ready(() => {
        main();
    });
})();
