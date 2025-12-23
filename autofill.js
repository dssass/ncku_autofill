(function() {
    console.clear();
    console.log("🚀 NCKU 評鑑自動填寫助手 - 主控台模式啟動");

    // 1. 取得所有「進入填寫」的連結
    // 根據截圖，連結文字通常是 "進入填寫"
    const links = Array.from(document.querySelectorAll('a'))
        .filter(a => a.innerText.trim().includes('進入填寫'));

    if (links.length === 0) {
        alert("❌ 找不到「進入填寫」的連結，請確認你是否在課程列表頁面。");
        return;
    }

    // 2. 在頁面上產生一個控制面板
    const panel = document.createElement('div');
    panel.style.cssText = "position:fixed; top:10px; right:10px; background:#222; color:#fff; padding:20px; z-index:9999; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.5); font-family:sans-serif; width: 300px;";
    panel.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#4CAF50;">🤖 評鑑自動填寫助手</h3>
        <p>偵測到 ${links.length} 門未填課程</p>
        <div id="status_log" style="height:100px; overflow-y:auto; background:#333; margin-bottom:10px; padding:5px; font-size:12px;">準備就緒...</div>
        <button id="start_btn" style="width:100%; padding:10px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">開始自動填寫 (需允許彈窗)</button>
        <p style="font-size:10px; color:#aaa; margin-top:5px;">⚠️ 請確保瀏覽器已允許此網站開啟「彈出式視窗」</p>
    `;
    document.body.appendChild(panel);

    const logDiv = document.getElementById('status_log');
    function log(msg) {
        logDiv.innerHTML += `<div>${msg}</div>`;
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    // 3. 處理單一問卷的函式 (核心邏輯)
    async function processSurvey(link, index) {
        return new Promise((resolve) => {
            log(`⏳ [${index + 1}] 開啟：${link.innerText}...`);
            
            // 開啟子視窗
            const childWin = window.open(link.href, `survey_win_${index}`, 'width=1000,height=800');

            if (!childWin) {
                log(`❌ [${index + 1}] 失敗：彈跳視窗被攔截！請允許彈窗。`);
                resolve();
                return;
            }

            let attempts = 0;
            // 設定定時器去檢查子視窗是否載入完成
            const timer = setInterval(() => {
                attempts++;
                
                // 如果視窗被關閉或超過 10 秒沒反應
                if (childWin.closed || attempts > 20) {
                    clearInterval(timer);
                    log(`⚠️ [${index + 1}] 視窗關閉或超時，跳過。`);
                    resolve();
                    return;
                }

                try {
                    // 嘗試抓取子視窗的 document
                    const doc = childWin.document;
                    const radios = doc.querySelectorAll('input[type="radio"]');

                    // 如果找到了選項，代表載入完成，開始填寫
                    if (radios.length > 0) {
                        log(`⚡ [${index + 1}] 偵測到題目，開始勾選...`);
                        
                        // === 填寫邏輯 ===
                        // 1. 勾選所有 "非常同意" (value=5)
                        doc.querySelectorAll('input[type="radio"][value="5"]').forEach(r => r.click());
                        // 2. 勾選所有 "學習態度" (value=a)
                        doc.querySelectorAll('input[type="radio"][value="a"]').forEach(r => r.click());
                        
                        // 3. 填寫文字框
                        doc.querySelectorAll('textarea').forEach(t => {
                            if(!t.value) t.value = "謝謝老師";
                        });

                        log(`✅ [${index + 1}] 填寫完畢！嘗試送出...`);

                        // === 嘗試送出 ===
                        // 這裡需要尋找送出按鈕，通常是 input type=submit 或 button
                        // 根據你的截圖，按鈕可能是 "確認並送出"
                        const buttons = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"]'));
                        const submitBtn = buttons.find(b => b.value === '確認並送出' || b.innerText.includes('送出') || b.innerText.includes('確認'));

                        if (submitBtn) {
                            // 覆寫子視窗的 alert，避免跳出 "是否確定送出" 卡住程式
                            childWin.window.alert = function() { return true; };
                            childWin.window.confirm = function() { return true; };
                            
                            submitBtn.click();
                            log(`🚀 [${index + 1}] 已按下送出。`);
                            
                            // 等待一下讓資料傳輸，然後關閉視窗
                            setTimeout(() => {
                                childWin.close();
                                resolve();
                            }, 1500); 
                        } else {
                            log(`⚠️ [${index + 1}] 找不到送出按鈕，請手動確認。`);
                            // 不自動關閉，讓使用者看一眼
                            setTimeout(() => { resolve(); }, 1000);
                        }
                        
                        clearInterval(timer); // 停止偵測
                    }
                } catch (e) {
                    // 跨網域存取錯誤 (尚未載入完成時可能會發生)
                    // 忽略錯誤，繼續等待
                }
            }, 500); // 每 0.5 秒檢查一次
        });
    }

    // 4. 按鈕點擊事件
    document.getElementById('start_btn').onclick = async () => {
        const btn = document.getElementById('start_btn');
        btn.disabled = true;
        btn.innerText = "正在執行中...";

        for (let i = 0; i < links.length; i++) {
            await processSurvey(links[i], i);
            // 每個問卷之間稍微休息一下，避免對伺服器造成太大負擔
            await new Promise(r => setTimeout(r, 1000));
        }

        log("🎉 所有任務已完成！");
        btn.innerText = "全部完成";
        alert("所有問卷已處理完畢！");
    };

})();
