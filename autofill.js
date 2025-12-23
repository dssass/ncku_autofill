(function() {
    console.clear();
    console.log("🚀 NCKU 評鑑自動填寫助手 (排除 IEET 版) - 啟動中...");

    // 1. 取得所有「進入填寫」的連結，但排除含有 IEET 的項目
    const links = Array.from(document.querySelectorAll('a'))
        .filter(a => {
            const linkText = a.innerText.trim();
            
            // 條件1: 連結必須包含 "進入填寫"
            if (!linkText.includes('進入填寫')) return false;

            // 條件2: 檢查整列 (tr) 內容是否包含 "IEET" (不分大小寫)
            const row = a.closest('tr');
            const rowText = row ? row.innerText.toUpperCase() : '';
            
            if (rowText.includes('IEET')) {
                console.log(`🚫 已忽略 IEET 問卷: ${row ? row.innerText.split('\t')[0] : '未知課程'}`);
                return false; // 跳過此連結
            }

            return true; // 加入清單
        });

    if (links.length === 0) {
        alert("❌ 找不到符合條件的問卷連結 (IEET 已被過濾)。\n請確認您是否在課程列表頁面，或所有問卷皆已完成。");
        return;
    }

    // 2. 在頁面上產生控制面板
    const panel = document.createElement('div');
    panel.style.cssText = "position:fixed; top:10px; right:10px; background:#222; color:#fff; padding:20px; z-index:9999; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.5); font-family:sans-serif; width: 300px; text-align:left;";
    panel.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#4CAF50;">🛡️ 自動填寫 (無 IEET)</h3>
        <p>偵測到 <strong>${links.length}</strong> 門待填課程</p>
        <div id="status_log" style="height:150px; overflow-y:auto; background:#333; margin-bottom:10px; padding:5px; font-size:12px; border:1px solid #555;">等待開始...</div>
        <button id="start_btn" style="width:100%; padding:10px; background:#d9534f; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">開始自動填寫</button>
        <p style="font-size:10px; color:#aaa; margin-top:5px;">⚠️ 請務必允許本網站的「彈出式視窗」</p>
    `;
    
    // 避免重複添加面板
    const oldPanel = document.querySelector('div[style*="position:fixed; top:10px; right:10px"]');
    if(oldPanel) oldPanel.remove();
    
    document.body.appendChild(panel);

    const logDiv = document.getElementById('status_log');
    function log(msg) {
        const time = new Date().toLocaleTimeString();
        logDiv.innerHTML += `<div style="border-bottom:1px solid #444; padding:2px;">[${time}] ${msg}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    // 3. 處理單一問卷的核心函式
    async function processSurvey(link, index) {
        return new Promise((resolve) => {
            // 嘗試取得課程名稱 (從同一列的第一個欄位)
            const row = link.closest('tr');
            const courseName = row ? row.cells[1].innerText.trim() : `問卷 ${index + 1}`;
            
            log(`⏳ [${index + 1}/${links.length}] 開啟：${courseName}...`);
            
            // 開啟子視窗
            const childWin = window.open(link.href, `survey_win_${index}`, 'width=1000,height=800');

            if (!childWin) {
                log(`❌ 失敗：視窗被瀏覽器攔截！請點擊網址列右側圖示允許彈窗。`);
                resolve();
                return;
            }

            let attempts = 0;
            const maxAttempts = 20; // 約 10 秒超時

            const timer = setInterval(() => {
                attempts++;
                
                if (childWin.closed) {
                    clearInterval(timer);
                    log(`⚠️ 視窗被手動關閉，跳過。`);
                    resolve();
                    return;
                }

                if (attempts > maxAttempts) {
                    clearInterval(timer);
                    childWin.close();
                    log(`⚠️ 載入超時 (10秒)，跳過此堂。`);
                    resolve();
                    return;
                }

                try {
                    const doc = childWin.document;
                    // 偵測是否有題目 (radio buttons)
                    const radios = doc.querySelectorAll('input[type="radio"]');

                    if (radios.length > 0) {
                        log(`⚡ 偵測到題目，開始作答...`);
                        
                        // === 填寫動作 ===
                        let count = 0;
                        // 1. 勾選 "非常同意" (value=5)
                        doc.querySelectorAll('input[type="radio"][value="5"]').forEach(r => { r.click(); count++; });
                        // 2. 勾選 "學習態度" (value=a)
                        doc.querySelectorAll('input[type="radio"][value="a"]').forEach(r => { r.click(); count++; });
                        
                        // 3. 補文字框
                        doc.querySelectorAll('textarea').forEach(t => {
                            if(!t.value) t.value = "謝謝老師";
                        });

                        log(`✅ 已勾選 ${count} 個選項。正在送出...`);

                        // === 送出動作 ===
                        const buttons = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"]'));
                        // 尋找文字包含 "送出" 或 "確認" 的按鈕
                        const submitBtn = buttons.find(b => b.value === '確認並送出' || b.innerText.includes('送出') || b.innerText.includes('確認'));

                        if (submitBtn) {
                            // 覆寫確認視窗，強制回傳 true
                            childWin.window.alert = function() { return true; };
                            childWin.window.confirm = function() { return true; };
                            
                            submitBtn.click();
                            log(`🚀 已按下送出按鈕。`);
                            
                            // 等待 1.5 秒讓資料傳輸後關閉
                            setTimeout(() => {
                                childWin.close();
                                resolve();
                            }, 1500); 
                        } else {
                            log(`⚠️ 找不到送出按鈕，請手動確認。`);
                            setTimeout(() => { resolve(); }, 2000);
                        }
                        
                        clearInterval(timer);
                    }
                } catch (e) {
                    // 跨網域存取限制錯誤 (Loading 中)，忽略並繼續等待
                }
            }, 500);
        });
    }

    // 4. 按鈕點擊事件
    document.getElementById('start_btn').onclick = async () => {
        const btn = document.getElementById('start_btn');
        btn.disabled = true;
        btn.innerText = "⏳ 正在執行自動排程...";
        btn.style.background = "#666";

        for (let i = 0; i < links.length; i++) {
            await processSurvey(links[i], i);
            // 每份問卷間隔 1 秒，緩衝伺服器壓力
            await new Promise(r => setTimeout(r, 1000));
        }

        log("🎉 全部任務完成！");
        btn.innerText = "完成";
        alert("所有非 IEET 問卷已處理完畢！");
    };

})();
