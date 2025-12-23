(function() {
    console.clear();
    console.log("🚀 NCKU 評鑑助手 (精準避開 IEET 版) - 啟動中...");

    // === 1. 智慧篩選連結 (核心修改) ===
    const links = Array.from(document.querySelectorAll('a')).filter(link => {
        // 基本條件：連結文字必須是 "進入填寫"
        if (!link.innerText.trim().includes('進入填寫')) return false;

        // 智慧判斷：檢查這個按鈕所在的「欄位標題」
        try {
            const cell = link.closest('td'); // 找到按鈕所在的格子
            if (!cell) return false;

            const index = cell.cellIndex; // 取得這是第幾欄 (例如第 3 欄)
            const table = link.closest('table');
            const header = table.rows[0].cells[index]; // 找到這一欄的標題 (th)

            // 如果標題包含 "IEET"，就絕對不選它
            if (header && header.innerText.toUpperCase().includes('IEET')) {
                console.log(`🚫 已忽略 IEET 問卷按鈕 (位於第 ${index+1} 欄)`);
                return false;
            }
            
            // 雙重保險：如果標題明確是 "授課教師"，那就一定要選
            // 如果找不到標題，但它是 "進入填寫"，我們暫時保留 (防止表格結構不同)
            return true;

        } catch (e) {
            // 如果結構解析失敗，為了安全起見，若文字沒問題就保留，但在 console 報警
            console.warn("⚠️ 表格結構特殊，無法判斷欄位標題，將嘗試執行。");
            return true;
        }
    });

    if (links.length === 0) {
        alert("❌ 找不到目標問卷。\n\n可能原因：\n1. 所有「授課教師問卷」皆已填寫完畢。\n2. 目前頁面上剩下的「進入填寫」都是 IEET 問卷 (已自動忽略)。");
        return;
    }

    // === 2. 建立控制面板 ===
    const panel = document.createElement('div');
    panel.style.cssText = "position:fixed; top:10px; right:10px; background:#222; color:#fff; padding:20px; z-index:9999; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.5); font-family:sans-serif; width: 320px; text-align:left;";
    panel.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#4CAF50;">🎯 授課教師問卷助手</h3>
        <p>偵測到 <strong>${links.length}</strong> 份教師問卷 (IEET已排除)</p>
        <div id="status_log" style="height:150px; overflow-y:auto; background:#333; margin-bottom:10px; padding:5px; font-size:12px; border:1px solid #555; color:#ddd;">等待指令...</div>
        <button id="start_btn" style="width:100%; padding:10px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">開始 (全選非常同意)</button>
        <p style="font-size:10px; color:#aaa; margin-top:5px;">⚠️ 請允許本網站的「彈出式視窗」</p>
    `;
    
    const oldPanel = document.querySelector('div[style*="position:fixed; top:10px; right:10px"]');
    if(oldPanel) oldPanel.remove();
    document.body.appendChild(panel);

    const logDiv = document.getElementById('status_log');
    function log(msg) {
        const time = new Date().toLocaleTimeString('zh-TW', { hour12: false });
        logDiv.innerHTML += `<div style="border-bottom:1px solid #444; padding:2px;">[${time}] ${msg}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    // === 3. 處理單一問卷 (Mothership 模式) ===
    async function processSurvey(link, index) {
        return new Promise((resolve) => {
            // 嘗試抓課名 (往左找第1欄)
            const row = link.closest('tr');
            const courseName = row ? row.cells[0].innerText.trim() : `問卷 ${index + 1}`; // 假設課名在第1欄
            
            log(`⏳ [${index + 1}/${links.length}] 開啟：${courseName}`);
            
            const childWin = window.open(link.href, `survey_win_${index}`, 'width=1000,height=800');

            if (!childWin) {
                log(`❌ 攔截！請點網址列右側圖示允許彈窗。`);
                resolve(); return;
            }

            let attempts = 0;
            const timer = setInterval(() => {
                attempts++;
                if (childWin.closed || attempts > 20) { // 10秒超時
                    clearInterval(timer);
                    if(!childWin.closed) childWin.close();
                    log(`⚠️ 視窗關閉或超時，跳過。`);
                    resolve(); return;
                }

                try {
                    const doc = childWin.document;
                    const radios = doc.querySelectorAll('input[type="radio"]');

                    if (radios.length > 0) {
                        log(`⚡ 載入成功，正在填寫...`);
                        
                        // === 填寫邏輯：全部非常同意 ===
                        let count = 0;
                        
                        // 1. 勾選 "非常同意" (value="5")
                        doc.querySelectorAll('input[type="radio"][value="5"]').forEach(r => { 
                            r.click(); 
                            count++; 
                        });
                        
                        // 2. 學習態度 (通常是 "a" 代表全勤/非常同意)
                        doc.querySelectorAll('input[type="radio"][value="a"]').forEach(r => { 
                            r.click(); 
                            count++; 
                        });
                        
                        // 3. 補滿文字框
                        doc.querySelectorAll('textarea').forEach(t => {
                            if(!t.value) t.value = "謝謝老師";
                        });

                        log(`✅ 已勾選 ${count} 格。送出中...`);

                        // === 自動送出 ===
                        const buttons = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"]'));
                        // 找尋任何看起來像送出的按鈕
                        const submitBtn = buttons.find(b => 
                            b.value === '確認並送出' || 
                            b.innerText.includes('送出') || 
                            b.innerText.includes('確認') ||
                            b.value === '送出'
                        );

                        if (submitBtn) {
                            // 覆寫 alert/confirm 防止卡住
                            childWin.window.alert = function() { return true; };
                            childWin.window.confirm = function() { return true; };
                            
                            submitBtn.click();
                            log(`🚀 已送出。`);
                            
                            // 稍微等待成功畫面再關閉
                            setTimeout(() => { 
                                childWin.close(); 
                                resolve(); 
                            }, 1500); 
                        } else {
                            log(`⚠️ 找不到送出鈕，請手動確認。`);
                            setTimeout(() => resolve(), 2000);
                        }
                        
                        clearInterval(timer);
                    }
                } catch (e) {
                    // 跨域錯誤 (載入中)，忽略
                }
            }, 500);
        });
    }

    // === 4. 啟動按鈕事件 ===
    document.getElementById('start_btn').onclick = async () => {
        const btn = document.getElementById('start_btn');
        btn.disabled = true;
        btn.innerText = "⏳ 正在處理...";
        btn.style.background = "#666";

        for (let i = 0; i < links.length; i++) {
            await processSurvey(links[i], i);
            // 每份問卷間隔 1 秒
            await new Promise(r => setTimeout(r, 1000));
        }

        log("🎉 全部完成！");
        btn.innerText = "任務結束";
        btn.style.background = "#4CAF50";
        alert("所有「授課教師問卷」已處理完畢！\nIEET 問卷已自動忽略。");
    };

})();
