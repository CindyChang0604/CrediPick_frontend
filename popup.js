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
