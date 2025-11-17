let allPapers = [];

// 顶会列表（用于过滤）
const topVenues = ['NeurIPS', 'ICML', 'CVPR', 'ACL', 'ICLR', 'AAAI', 'IJCAI', 'EMNLP', 'COLING'];

// 加载数据
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    allPapers = data;
    renderResults(allPapers);
  })
  .catch(err => {
    document.getElementById('results').innerHTML = '<p>加载数据失败，请检查 data.json 是否存在。</p>';
    console.error(err);
  });

// 搜索与过滤
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.querySelectorAll('#filters input').forEach(el => {
  el.addEventListener('change', applyFilters);
});

function applyFilters() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const selectedVenues = Array.from(document.querySelectorAll('#filters input:checked'))
    .map(cb => cb.id.replace('filter', ''));

  let filtered = allPapers.filter(paper => {
    // 文本匹配
    const matchesQuery =
      paper.title.toLowerCase().includes(query) ||
      paper.authors.some(a => a.toLowerCase().includes(query)) ||
      paper.affiliations.some(aff => aff.toLowerCase().includes(query)) ||
      paper.venue.toLowerCase().includes(query);

    // Venue 过滤
    const matchesVenue = selectedVenues.length === 0 || selectedVenues.includes(paper.venue);

    return matchesQuery && matchesVenue;
  });

  renderResults(filtered);
}

function renderResults(papers) {
  const container = document.getElementById('results');
  if (papers.length === 0) {
    container.innerHTML = '<p>未找到匹配结果。</p>';
    return;
  }

  container.innerHTML = papers.map(p => `
    <div class="result-item">
      <div class="result-title"><a href="${p.url}" target="_blank">${p.title}</a></div>
      <div class="result-authors">作者: ${p.authors.join(', ')}</div>
      <div class="result-affiliations">单位: ${p.affiliations.join('; ')}</div>
      <div class="result-venue">会议: ${p.venue} ${p.year}</div>
    </div>
  `).join('');
}
