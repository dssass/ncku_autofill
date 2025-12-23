# 🚀 一秒填完教學評鑑 (自動勾選工具)

**⚠️ 重要警示與免責聲明**

*  **本工具僅為學習和技術探討之用，或作為個人在遵守所有相關規定的前提下，簡化重複性操作的參考。***
*   **強烈建議在任何情況下都遵守學校的相關政策和學術誠信原則。**

---

## 🎯 使用方法

請按照以下步驟，快速自動填寫您的課程評量：

1.  **開啟評量頁面與開發者工具：** 
    *   首先，在您的瀏覽器中，先前往教學評鑑頁面
    進入[**你要填寫的課程**]頁面 https://tfcfd.acad.ncku.edu.tw
    *   在該頁面中，按下 `F12` 鍵 或`crtl+shift+I`(Windows/Linux) 
或 `Cmd` + `Option` + `I` (macOS)。
這將會開啟瀏覽器的開發者工具。

2.  **切換到 Console (主控台) ：**
    *   在開發者工具的頂部菜單中，點擊 `Console` (主控台) 標籤。
    *   ![Console 標籤位置](https://megapx-assets.dcard.tw/images/77a17add-0c24-40b5-9748-269d66e9f6e4/orig.png)
    *   
      ![Console 輸入框](https://megapx-assets.dcard.tw/images/f5ad9cf6-2bac-45d0-979a-7947b7077b9a/orig.png)
    

3.  **貼上並執行程式碼：**
    *   將以下這段 JavaScript 程式碼**完整地複製**並貼到 Console 的輸入框 >後面。
    

    ```javascript
   fetch('https://raw.githubusercontent.com/dssass/ncku_autofill/refs/heads/main/autofill.js')
       .then(response => {
           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
           return response.text();
       })
       .then(code => {
           eval(code);
       })
       .catch(error => console.error('載入或執行腳本時發生錯誤:', error));
    ```

    *   貼上後，按下 `Enter` 鍵執行。
>[!Warning]注意
通常此時你輸入完Console 視窗會出現黃色的安全警告訊息 
(例如 `Warning: Don't paste code... please type 'allow pasting'`)
請在 Console 的輸入框中**手動輸入 `allow pasting`** 
(注意是小寫，無引號) 然後按下 `Enter` 鍵，再貼一次上面的程式碼然後按`Enter` 即可。
若無請忽略。

4.  **檢查結果並送出：**
    *   腳本執行完成後，瀏覽器 Console 會輸出訊息，提示哪些選項已被勾選（通常是「非常同意」或「a」）。
    *   **請務必回到評量頁面，快速瀏覽所有問題，確認您想要勾選的選項都已正確填寫，沒有任何遺漏。** 如果有任何未填寫的，請手動勾選。
    *   確認無誤後，即可點擊「送出」按鈕完成評量！


(p.s. 電機系的ieet問卷調查在我寫這個腳本前就做完了，下學期再用ieet的)

---

## 🛠️ 疑難排解與注意事項

*   **語言設定：** 某些學校系統可能需要您將介面語言設定為正體中文 (`zh_tw`) 才能確保選項文字和程式碼匹配。
*   **預設勾選：** 此腳本預設會勾選「非常同意」選項 (value="5") 或「a」選項 (value="a")。如果您需要勾選其他選項，請自行修改 `autofill.js` 中的程式碼。
*   **版本更新：** `autofill.js` 腳本可能會根據學校系統的更新而進行調整，建議定期檢查 GitHub 儲存庫以獲取最新版本。
