(function() {
    console.clear();
    console.log("🚀 NCKU 評鑑助手 (自動關閉版) - 啟動中...");

    // === 1. 智慧篩選連結 ===
    const links = Array.from(document.querySelectorAll('a')).filter(link => {
        if (!link.innerText.trim().includes('進入填寫')) return false;
        try {
            const cell = link.closest('td');
            if (!cell) return false;
            const index = cell.cellIndex;
            const table = link.closest('table');
            const header = table.rows[0].cells[index];
            if (header && header.innerText.toUpperCase().includes('IEET')) {
                return false; // 忽略 IEET
            }
            return true;
        } catch (e) {
            return true; // 結構異常時保守保留
        }
    });

    if (links.length === 0) {
        alert("❌ 沒有偵測到需要填寫的「教師問卷」。(IEET 已排除)");
        return;
    }

    // === 2. 建立面板 ===
    const panel = document.createElement('div');
    panel.style.cssText = "position:fixed; top:10px; right:10px; background:#222; color:#fff; padding:20px; z-index:9999; border-radius:8px; box-shadow:0 0 15px rgba(0,0,0,0.6); font-family:sans-serif; width: 320px; text-align:left; transition: opacity 1s ease-out;";
    panel.innerHTML = `
        <h3 style="margin:0 0 10px 0; color:#4CAF50;">🤖 全自動評鑑助手</h3>
        <p>還有 <strong>${links.length}</strong> 份問卷待處理</p>
        <div id="status_log" style="height:150px; overflow-y:auto; background:#333; margin-bottom:10px; padding:5px; font-size:12px; border:1px solid #555; color:#ddd;">準備就緒...</div>
        <button id="start_btn" style="width:100%; padding:10px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">開始執行</button>
        <p style="font-size:10px; color:#aaa; margin-top:5px;">完成後將自動關閉面板</p>
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

    // === 3. 處理單一問卷 ===
    async function processSurvey(link, index) {
        return new Promise((resolve) => {
            const row = link.closest('tr');
            const courseName = row ? row.cells[0].innerText.trim() : `問卷 ${index + 1}`;
            
            log(`⏳ [${index + 1}/${links.length}] 正在處理：${courseName}`);
            
            const childWin = window.open(link.href, `survey_win_${index}`, 'width=1000,height=800');

            if (!childWin) {
                log(`❌ 視窗被攔截，請允許彈窗！`);
                resolve(); return;
            }

            let attempts = 0;
            const timer = setInterval(() => {
                attempts++;
                if (childWin.closed || attempts > 20) {
                    clearInterval(timer);
                    if(!childWin.closed) childWin.close();
                    log(`⚠️ 跳過 (視窗關閉或超時)`);
                    resolve(); return;
                }

                try {
                    const doc = childWin.document;
                    if (doc.querySelectorAll('input[type="radio"]').length > 0) {
                        
                        // 填寫：非常同意 (5) & 學習態度 (a)
                        let count = 0;
                        doc.querySelectorAll('input[type="radio"][value="5"]').forEach(r => { r.click(); count++; });
                        doc.querySelectorAll('input[type="radio"][value="a"]').forEach(r => { r.click(); count++; });
                        doc.querySelectorAll('textarea').forEach(t => { if(!t.value) t.value = "謝謝老師"; });

                        log(`✅ 已勾選 ${count} 格。送出中...`);

                        // 送出
                        const btns = Array.from(doc.querySelectorAll('button, input[type="button"], input[type="submit"]'));
                        const submitBtn = btns.find(b => b.value === '確認並送出' || b.innerText.includes('送出') || b.innerText.includes('確認') || b.value === '送出');

                        if (submitBtn) {
                            childWin.window.alert = () => true;
                            childWin.window.confirm = () => true;
                            submitBtn.click();
                            log(`🚀 已送出。`);
                            setTimeout(() => { childWin.close(); resolve(); }, 1500); 
                        } else {
                            setTimeout(() => resolve(), 2000);
                        }
                        clearInterval(timer);
                    }
                } catch (e) {}
            }, 500);
        });
    }

    // === 4. 執行與自動關閉 ===
    document.getElementById('start_btn').onclick = async () => {
        const btn = document.getElementById('start_btn');
        btn.disabled = true;
        btn.innerText = "⏳ 執行中...";
        btn.style.background = "#666";

        for (let i = 0; i < links.length; i++) {
            await processSurvey(links[i], i);
            await new Promise(r => setTimeout(r, 1000));
        }

        // === 新增：自動關閉邏輯 ===
        log("🎉 全部完成！ 3 秒後自動消失...");
        btn.innerText = "完成 (即將關閉)";
        
        // 倒數 3 秒後移除面板
        setTimeout(() => {
            panel.style.opacity = "0"; // 淡出效果
            setTimeout(() => {
                panel.remove(); // 移除元素
                console.log("👋 面板已自動關閉。");
            }, 1000);
        }, 3000);
    };
})();
