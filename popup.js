document.querySelector('.close-svgrepo-com').addEventListener('click', () => {
    window.close();
  });


// 提取目前瀏覽網頁的 domain
function getCurrentDomain() {
  const hostname = window.location.hostname;

  // 如果在本地執行，返回一個假設的 domain 進行測試
  if (!hostname || hostname === 'localhost') {
    return 'example.com'; // 測試用的假設 domain
  }

  return hostname.replace(/^www\./, ''); // 去除 www
}

// 將 domain 顯示到 #logo-container
function displayDomainInContainer() {
  // 獲取當前網頁的 domain
  const domain = getCurrentDomain();
  
  // 獲取容器元素
  const container = document.getElementById('logo-container');
  
  // 確認容器存在
  if (container) {
    container.textContent = domain; // 使用 domain 替換容器內文字
  } else {
    console.error('Element with id "logo-container" not found.');
  }
}

// 確保 DOM 加載完成後執行
document.addEventListener('DOMContentLoaded', displayDomainInContainer);



// 獲取當前網站的完整 URL
function getCurrentPlatformUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const url = new URL(tabs[0].url);
        resolve(url.origin + url.pathname); // 獲取完整的 URL
      } else {
        reject("無法獲取活動頁面的 URL");
      }
    });
  });
}

// 向後端請求數據
async function getCurrentTabUrl() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      if (!tabs.length || !tabs[0].url) {
        return reject(new Error("無法獲取當前 Tab 的 URL 或 URL 無效"));
      }
      resolve(tabs[0].url);
    });
  });
}

async function fetchCreditCards() {
  try {
    const currentUrl = await getCurrentTabUrl();
    console.log("偵測到的完整網址:", currentUrl);

    const urlObject = new URL(currentUrl);
    let platformUrl = `${urlObject.origin}/`;
    platformUrl = platformUrl.endsWith("/") ? platformUrl.slice(0, -1) : platformUrl;
    console.log("最終標準化的域名:", platformUrl);

    const response = await fetch(`http://localhost:3000/api/cards?platform_url=${encodeURIComponent(platformUrl)}`);
    // const response = await fetch(`https://credipick-backend.zeabur.app}`);
    if (!response.ok) {
      throw new Error(`伺服器回應錯誤: ${response.status}, 詳細資訊: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("信用卡數據:", data);

    if (data.length > 0) {
      const topCard = data.sort((a, b) => (b.reward_percentage || 0) - (a.reward_percentage || 0))[0];
      const cashback = topCard.reward_percentage ? `${(topCard.reward_percentage * 100).toFixed(0)}%` : "N/A";
      const rewardType = topCard.reward_type?.en || "Cashback";
      const cashbackElement = document.querySelector(".div");
      if (cashbackElement) {
        cashbackElement.textContent = `Up to ${cashback} ${rewardType}`;
      }
    }

    displayCards(data);
  } catch (error) {
    console.error("獲取信用卡數據失敗:", error);
    displayMessage("無法獲取信用卡數據，請稍後再試。");
  }
}


function displayCards(cards) {
  const container = document.querySelector(".frame");
  if (!container) {
    console.error("未找到 .frame 容器，請檢查 HTML 結構！");
    return;
  }

  if (cards.length === 0) {
    container.innerHTML = `<p class="error-message">No Credit Cards Recommendation.</p>`;
    return;
  }

  container.innerHTML = ""; // 清空現有內容

  cards.forEach((card, index) => {
    const upperLimit = card.upper_limit === "無上限" ? "♾️" : card.upper_limit || "N/A";

    const rewardPercentage = card.reward_percentage ? `${(card.reward_percentage * 100).toFixed(0)}%` : "N/A";

    const cardElement = document.createElement("div");
    cardElement.className = "group-3";

    cardElement.innerHTML = `
      <div class="text-wrapper-3">Top ${index + 1}</div>
      <div class="group-4">
        <div class="overlap-group-2">
          <div class="overlap-2">
            <div class="group-5">
              <img class="element" src="img/point.png" />
              <div class="text-wrapper-4">${upperLimit}</div>
            </div>
            <p class="p">${card.card_name.en || "unknown card"}</p>
            <div class="text-wrapper-5">${card.bank_name.en || "unknown bank"}</div>
          </div>
          <div class="text-wrapper-9">2024/01/01 ~ ${card.due_day || "N/A"}</div>
          <img class="creditcard" src="${card.card_pic_url}" alt="${card.card_name?.en || "信用卡"}" >
          <div class="text-wrapper-8">Benefits</div>
          <div class="group-7">
            <img class="image-2" src="img/check.png" alt="Benefit" />
            <div class="text-wrapper-7">
              ${rewardPercentage || "N/A"} ${card.reward_type?.en || ""}
            </div>
          </div>
          <div class="group-8">
            <img class="image-2" src="img/check.png" alt="Benefit" />
            <div class="text-wrapper-7">
              ${card.detail.en || "It's a good card"}
            </div>
          </div>
          <div class="group-6">
            <a href="${card.link.hyperlink || "#"}" target="_blank" class="apply-link">
              <div class="text-wrapper-6">Apply Now</div>
              <img class="vector" src="img/vector.svg" alt="Apply" />
            </a>
          </div>
        </div>
      </div>
    `;

    container.appendChild(cardElement);
  });
}

function displayMessage(message) {
  const container = document.querySelector(".frame");
  if (!container) {
    console.error("未找到 .frame 容器，請檢查 HTML 結構！");
    return;
  }

  container.innerHTML = `<p class="error-message">${message}</p>`;
}

document.addEventListener("DOMContentLoaded", fetchCreditCards);



