// ===== 配置区 =====
const VENUES = ['NeurIPS', 'ICML', 'CVPR', 'ACL', 'ICLR', 'AAAI', 'EMNLP'];
const YEARS = [2024, 2025, 2026]; // 根据你的数据调整年份范围

// ===== 全局状态 =====
let allPapers = [];
let loadingComplete = false;

const searchInput = document.getElementById('searchInput');
const filterCheckboxes = document.querySelectorAll('#filters input[type="checkbox"]');
const resultsContainer = document.getElementById('results');

// ===== 工具函数：生成所有 JSON 路径 =====
function generateFileList() {
  const files = [];
  for (const venue of VENUES) {
    for (const year of YEARS) {
      const shortYear = String(year).slice(-2); // 2025 → "25"
      files.push(`data/${venue}${shortYear}.json`);
    }
  }
  return files;
}

// ===== 安全加载单个 JSON（忽略 404 或格式错误）=====
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data;
      } else {
        console.warn(`Invalid JSON format in ${url}: expected array.`);
        return [];
      }
    } else if (response.status === 404) {
      // 文件不存在，静默忽略
      return [];
    } else {
      console.warn(`Failed to load ${url}: HTTP ${response.status}`);
      return [];
    }
  } catch (err) {
    console.warn(`Network error loading ${url}:`, err);
    return [];
  }
}

// ===== 并行加载所有论文数据 =====
async function loadAllPapers() {
  const files = generateFileList();
  resultsContainer.innerHTML = '<p>正在加载论文数据，请稍候...</p>';

  try {
    const promises = files.map(file => loadJSON(file));
    const results = await Promise.all(promises);
    allPapers = results.flat();
    loadingComplete = true;
    applyFilters(); // 初次渲染结果
  } catch (err) {
    console.error('Unexpected error during data loading:', err);
    resultsContainer.innerHTML = '<p>加载失败，请刷新页面重试。</p>';
  }
}

// ===== 渲染结果列表 =====
function renderResults(papers) {
  if (papers.length === 0) {
    resultsContainer.innerHTML = '<p>未找到匹配结果。</p>';
    return;
  }

  const htmlItems = papers.map(p => {
    // 构建 arXiv 链接
    const arxivLink = p.arxiv_url
      ? `<a href="${p.arxiv_url}" target="_blank" rel="noopener" class="arxiv-link">arXiv</a>`
      : '';

    // 构建官方链接
    const officialLink = p.official_url
      ? `<a href="${p.official_url}" target="_blank" rel="noopener" class="official-link">Official</a>`
      : '';

    // 合并链接（仅显示存在的）
    const links = [arxivLink, officialLink].filter(Boolean).join(' ');
    const linksBlock = links
      ? `<div class="result-links">${links}</div>`
      : '';

    return `
      <div class="result-item">
        <div class="result-title">${p.title}</div>
        <div class="result-authors">作者: ${p.authors.join(', ')}</div>
        <div class="result-affiliations">单位: ${p.affiliations.join('; ')}</div>
        <div class="result-venue">${p.venue} ${p.year}</div>
        ${linksBlock}
      </div>
    `;
  });

  resultsContainer.innerHTML = htmlItems.join('');
}

// ===== 应用搜索与筛选 =====
function applyFilters() {
  if (!loadingComplete) {
    resultsContainer.innerHTML = '<p>正在加载论文数据，请稍候...</p>';
    return;
  }

  const query = searchInput.value.trim().toLowerCase();

  // 获取选中的会议
  const selectedVenues = Array.from(filterCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.id.replace('filter', ''));

  // 过滤论文
  const filtered = allPapers.filter(paper => {
    // 文本匹配：标题 / 作者 / 单位 / 会议名
    const textMatch =
      paper.title.toLowerCase().includes(query) ||
      paper.authors.some(a => a.toLowerCase().includes(query)) ||
      paper.affiliations.some(aff => aff.toLowerCase().includes(query)) ||
      paper.venue.toLowerCase().includes(query);

    // Venue 筛选
    const venueMatch = selectedVenues.length === 0 || selectedVenues.includes(paper.venue);

    return textMatch && venueMatch;
  });

  renderResults(filtered);
}

// ===== 初始化 =====
loadAllPapers();

// 绑定事件
searchInput.addEventListener('input', applyFilters);
filterCheckboxes.forEach(cb => {
  cb.addEventListener('change', applyFilters);
});
