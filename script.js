function renderResults(papers) {
  if (papers.length === 0) {
    resultsContainer.innerHTML = '<p>未找到匹配结果。</p>';
    return;
  }

  resultsContainer.innerHTML = papers
    .map(p => {
      const arxivLink = p.arxiv_url 
        ? `<a href="${p.arxiv_url}" target="_blank" rel="noopener" class="arxiv-link">arXiv</a>` 
        : '';
      
      const officialLink = p.official_url 
        ? `<a href="${p.official_url}" target="_blank" rel="noopener" class="official-link">Official</a>` 
        : '';

      const links = arxivLink || officialLink 
        ? `<div class="result-links">${[arxivLink, officialLink].filter(Boolean).join(' ')}</div>` 
        : '';

      return `
        <div class="result-item">
          <div class="result-title">${p.title}</div>
          <div class="result-authors">作者: ${p.authors.join(', ')}</div>
          <div class="result-affiliations">单位: ${p.affiliations.join('; ')}</div>
          <div class="result-venue">${p.venue} ${p.year}</div>
          ${links}
        </div>
      `;
    })
    .join('');
}
