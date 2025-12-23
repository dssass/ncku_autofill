(function() {
    let dynamicPrefix = '';
    const firstRadio = document.querySelector('input[type="radio"]');

    // 嘗試從頁面第一個單選按鈕的 name 屬性中提取動態前綴
    if (firstRadio && firstRadio.name) {
        const fullName = firstRadio.name;
        // 假設前綴是 name 屬性中第一個底線符號之前的部分 (e.g., "E2082_1_4" -> "E2082")
        const parts = fullName.split('_');
        if (parts.length > 0) {
            dynamicPrefix = parts[0];
            console.log("✅ 偵測到動態前綴 (Dynamic Prefix):", dynamicPrefix);
        } else {
            console.error("❌ 無法從第一個單選按鈕的 name 屬性中解析出動態前綴。請手動檢查 HTML。");
            return; // 終止執行
        }
    } else {
        console.error("❌ 頁面上沒有找到任何單選按鈕。無法執行自動勾選。");
        return; // 終止執行
    }

    // === 第一部分: 授課老師評量 (問題 1-11) ===
    console.log("\n--- 開始勾選第一部分 (授課老師評量) ---");
    // 根據最新資訊，這部分的 name 模式統一為 PREFIX_1_X
    for (let i = 1; i <= 11; i++) {
        const radioGroupName = `${dynamicPrefix}_1_${i}`; // <-- 統一為這個模式
        const stronglyAgreeSelector = `input[type="radio"][name="${radioGroupName}"][value="5"]`;
        const stronglyAgreeRadio = document.querySelector(stronglyAgreeSelector);

        if (stronglyAgreeRadio) {
            stronglyAgreeRadio.checked = true;
            console.log(`✅ [第一部分] 問題 ${i} 已勾選「非常同意」 (name: ${radioGroupName})。`);
        } else {
            console.warn(`⚠️ [第一部分] 找不到問題 ${i} 的「非常同意」選項。請檢查 name (預期為 ${radioGroupName}) 或 value (預期為 5) 屬性是否不同。`);
        }
    }

    // === 第三部分: 學習態度自評 (問題 1-2) ===
    console.log("\n--- 開始勾選第三部分 (學習態度自評) ---");
    // 這部分有 2 題，我們勾選 'a'
    for (let i = 1; i <= 2; i++) {
        const radioGroupName = `${dynamicPrefix}_3_${i}`; // name 模式
        const agreeSelector = `input[type="radio"][name="${radioGroupName}"][value="a"]`;
        const radio = document.querySelector(agreeSelector);

        if (radio) {
            radio.checked = true;
            console.log(`✅ [學習態度] 問題 ${i} 已勾選「a」 (name: ${radioGroupName})。`);
        } else {
            console.warn(`⚠️ [學習態度] 找不到問題 ${i} 的「a」選項。請檢查 name (預期為 ${radioGroupName}) 或 value (預期為 a) 屬性是否不同。`);
        }
    }

    // === 學習成效自評  ===
    console.log("\n--- 開始勾選學習成效自評 ---");
    // *** 這裡已修正為 11 題！ ***
    for (let i = 1; i <= 20; i++) { // <-- 修正迴圈範圍至 11
        const radioGroupName = `${dynamicPrefix}_4_${i}`; // name 模式
        const stronglyAgreeSelector = `input[type="radio"][name="${radioGroupName}"][value="5"]`;
        const radio = document.querySelector(stronglyAgreeSelector);

        if (radio) {
            radio.checked = true;
            console.log(`✅ [學習成效] 問題 ${i} 已勾選「非常同意」。`);
        } else {
            console.warn(`⚠️ [學習成效] 找不到問題 ${i} 的「非常同意」選項。請檢查 name (預期為 ${radioGroupName}) 或 value (預期為 5) 屬性是否不同。`);
        }
    }

    console.log("\n✨ 所有自動勾選操作已完成。請檢查頁面確認。✨");
})();
