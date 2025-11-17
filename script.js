// 配置：顶会列表 + 年份范围
const VENUES = ['NeurIPS', 'ICML', 'CVPR', 'ACL', 'ICLR', 'AAAI', 'EMNLP', 'ICCV'];
const YEARS = [2023, 2024, 2025, 2026]; // 根据你有的数据调整

let allPapers = [];
let loadingComplete = false;

// 生成所有需要加载的文件路径
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

// 安全加载单个 JSON（忽略 404）
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.warn(`Failed to load ${url}:`, err);
  }
  return []; // 文件不存在或出错时返回空数组
}

// 并行加载所有 JSON
async function loadAllPapers() {
  const files = generateFileList();
  const promises = files.map(file => loadJSON(file));
  const results = await Promise.all(promises);
  allPapers = results.flat(); // 合并所有论文
  loadingComplete = true;
  applyFilters(); // 初次渲染
}

// 初始化
loadAllPapers();

// DOM 元素
const searchInput = document.getElementById('searchInput');
const filterCheckboxes = document.querySelectorAll('#filters input[type="checkbox"]');
const resultsContainer = document.getElementById('results');

// 监听输入和筛选器
searchInput.addEventListener('input', applyFilters);
filterCheckboxes.forEach(cb => cb.addEventListener('change', applyFilters));

function applyFilters() {
  if (!loadingComplete) {
    resultsContainer.innerHTML = '<p>正在加载数据...</p>';
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  const selectedVenues = Array.from(filterCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.id.replace('filter', ''));

  let filtered = allPapers.filter(paper => {
    // 文本搜索：标题 / 作者 / 单位 / 会议名
    const textMatch =
      paper.title.toLowerCase().includes(query) ||
      paper.authors.some(a => a.toLowerCase().includes(query)) ||
      paper.affiliations.some(aff => aff.toLowerCase().includes(query)) ||
      paper.venue.toLowerCase().includes(query);

    // Venue 过滤
    const venueMatch = selectedVenues.length === 0 || selectedVenues.includes(paper.venue);

    return textMatch && venueMatch;
  });

  renderResults(filtered);
}

function renderResults(papers) {
  if (papers.length === 0) {
    resultsContainer.innerHTML = '<p>未找到匹配结果。</p>';
    return;
  }

  resultsContainer.innerHTML = papers
    .map(p => `
      <div class="result-item">
        <div class="result-title">
          <a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>
        </div>
        <div class="result-authors">作者: ${p.authors.join(', ')}</div>
        <div class="result-affiliations">单位: ${p.affiliations.join('; ')}</div>
        <div class="result-venue">${p.venue} ${p.year}</div>
      </div>
    `)
    .join('');
}
