/**
 * 简单的Markdown查看器
 * 用于在浏览器中直接查看Markdown文件
 * 使用方法：在index.html中引入此脚本，然后使用?file=文件名.md参数访问
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the current file from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get('file');
  
  // If a file is specified, load and display it
  if (fileName) {
    // Create container for markdown content
    const contentContainer = document.createElement('div');
    contentContainer.className = 'markdown-container';
    
    // Add back button
    const backButton = document.createElement('a');
    backButton.href = 'index.html';
    backButton.className = 'back-button';
    backButton.textContent = '← 返回首页';
    contentContainer.appendChild(backButton);
    
    // Create and add the content element
    const contentElement = document.createElement('div');
    contentElement.className = 'markdown-content';
    contentElement.innerHTML = '<div class="loading">加载中...</div>';
    contentContainer.appendChild(contentElement);
    
    // Replace the body content with our container
    document.body.innerHTML = '';
    document.body.appendChild(contentContainer);
    
    // Add reference to external CSS file if not already present
    if (!document.querySelector('link[href="styles.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      cssLink.href = 'styles.css';
      document.head.appendChild(cssLink);
    }
    
    // Load the markdown file
    fetch(fileName)
      .then(response => {
        if (!response.ok) {
          throw new Error(`文件加载失败: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(markdownText => {
        // Convert markdown to HTML
        contentElement.innerHTML = markdownToHtml(markdownText);
        
        // Add file title
        const titleElement = document.createElement('div');
        titleElement.className = 'file-title';
        titleElement.innerHTML = `<h1>${fileName}</h1>`;
        contentElement.insertBefore(titleElement, contentElement.firstChild);
        
        // Update page title
        document.title = `${fileName} - 前端组件需求与实现文档`;
        
        // Add table of contents if the content is large
        if (markdownText.length > 1000) {
          addTableOfContents(contentElement);
        }
      })
      .catch(error => {
        contentElement.innerHTML = `<div class="error-message">
          <h3>错误</h3>
          <p>${error.message}</p>
          <p>请检查文件是否存在或刷新页面重试。</p>
        </div>`;
      });
  }
});

// Function to add a table of contents
function addTableOfContents(contentElement) {
  const headings = contentElement.querySelectorAll('h2, h3');
  if (headings.length > 2) {
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents';
    tocContainer.innerHTML = '<h3>目录</h3><ul></ul>';
    const tocList = tocContainer.querySelector('ul');
    
    headings.forEach((heading, index) => {
      const id = `heading-${index}`;
      heading.id = id;
      
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.textContent = heading.textContent;
      
      // Indent h3 elements
      if (heading.tagName.toLowerCase() === 'h3') {
        listItem.style.paddingLeft = '20px';
      }
      
      listItem.appendChild(link);
      tocList.appendChild(listItem);
    });
    
    // Insert TOC after the title
    const title = contentElement.querySelector('.file-title');
    if (title && title.nextSibling) {
      contentElement.insertBefore(tocContainer, title.nextSibling);
    } else {
      contentElement.insertBefore(tocContainer, contentElement.firstChild);
    }
  }
}

// Function to convert Markdown to HTML
function markdownToHtml(markdown) {
  // Process code blocks first
  markdown = markdown.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
    // Apply syntax highlighting
    code = escapeHtml(code);
    code = applySyntaxHighlighting(code);
    return `<pre><code class="language-${language}">${code}</code></pre>`;
  });
  
  // Process inline code
  markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Headers
  markdown = markdown.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  markdown = markdown.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  markdown = markdown.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  
  // Bold and italic
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Lists
  markdown = markdown.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
  markdown = markdown.replace(/(<li>.*<\/li>)/gms, '<ol>$1</ol>');
  
  markdown = markdown.replace(/^\s*[\*\-]\s+(.*$)/gm, '<li>$1</li>');
  markdown = markdown.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
  
  // Fix nested lists
  markdown = markdown.replace(/<\/ul>\s*<ul>/g, '');
  markdown = markdown.replace(/<\/ol>\s*<ol>/g, '');
  
  // Links
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // Images
  markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2">');
  
  // Horizontal rule
  markdown = markdown.replace(/^\s*[\-=_]{3,}\s*$/gm, '<hr>');
  
  // Tables
  markdown = processMarkdownTables(markdown);
  
  // Paragraphs
  markdown = markdown.replace(/^\s*(\n)?(.+)/gm, function(match, newline, content) {
    if (content.startsWith('<h') || 
      content.startsWith('<ul') || 
      content.startsWith('<ol') || 
      content.startsWith('<li') || 
      content.startsWith('<blockquote') || 
      content.startsWith('<pre') || 
      content.startsWith('<hr') || 
      content.startsWith('<table')) {
      return match;
    }
    return `<p>${content}</p>`;
  });
  
  // Blockquotes
  markdown = markdown.replace(/^\s*>\s+(.*$)/gm, '<blockquote>$1</blockquote>');
  markdown = markdown.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');
  
  return markdown;
}

// Function to process Markdown tables
function processMarkdownTables(markdown) {
  // Process tables (assuming the standard GFM format)
  const tableRegex = /^\|(.*)\|\s*\n\|\s*[-:]+[-| :]*\|\s*\n(\|.*\|\s*\n)+/gm;
  
  return markdown.replace(tableRegex, function(table) {
    const rows = table.trim().split('\n');
    
    // Process header row
    const headerRow = rows[0];
    const headerCells = headerRow.split('|').slice(1, -1).map(cell => cell.trim());
    
    // Process alignment row
    const alignmentRow = rows[1];
    const alignments = alignmentRow.split('|').slice(1, -1).map(cell => {
      cell = cell.trim();
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      return 'left';
    });
    
    // Build header HTML
    let headerHtml = '<thead><tr>';
    headerCells.forEach((cell, index) => {
      headerHtml += `<th style="text-align: ${alignments[index]}">${cell}</th>`;
    });
    headerHtml += '</tr></thead>';
    
    // Build body HTML
    let bodyHtml = '<tbody>';
    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue;
      
      const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
      bodyHtml += '<tr>';
      cells.forEach((cell, index) => {
        bodyHtml += `<td style="text-align: ${alignments[index]}">${cell}</td>`;
      });
      bodyHtml += '</tr>';
    }
    bodyHtml += '</tbody>';
    
    return `<table>${headerHtml}${bodyHtml}</table>`;
  });
}

// Function to apply syntax highlighting to code
function applySyntaxHighlighting(code) {
  // Simple syntax highlighting for common programming languages
  // Highlight keywords
  const keywords = [
    'function', 'return', 'if', 'else', 'for', 'while', 'switch', 'case', 'break',
    'const', 'let', 'var', 'import', 'export', 'from', 'class', 'extends', 'new',
    'true', 'false', 'null', 'undefined'
  ];
  
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
  }
  
  // Highlight strings
  code = code.replace(/(["'`])(.*?)\1/g, '<span class="string">$1$2$1</span>');
  
  // Highlight comments
  code = code.replace(/\/\/(.*)/g, '<span class="comment">//\$1</span>');
  
  return code;
}

// Function to escape HTML characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 添加必要的样式
const style = document.createElement('style');
style.textContent = `
  .markdown-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
  }
  
  .markdown-body h1, .markdown-body h2, .markdown-body h3,
  .markdown-body h4, .markdown-body h5, .markdown-body h6 {
    color: #2c3e50;
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
  }
  
  .markdown-body h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: .3em;
  }
  
  .markdown-body h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: .3em;
  }
  
  .markdown-body h3 {
    font-size: 1.25em;
  }
  
  .markdown-body code {
    background-color: rgba(27,31,35,.05);
    border-radius: 3px;
    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
    font-size: 85%;
    padding: .2em .4em;
  }
  
  .markdown-body pre {
    background-color: #f6f8fa;
    border-radius: 3px;
    padding: 16px;
    overflow: auto;
  }
  
  .markdown-body pre code {
    background-color: transparent;
    padding: 0;
  }
  
  .markdown-body a {
    color: #0366d6;
    text-decoration: none;
  }
  
  .markdown-body a:hover {
    text-decoration: underline;
  }
  
  .markdown-body ul, .markdown-body ol {
    padding-left: 2em;
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  .markdown-body li {
    margin-top: 0.25em;
  }
  
  .markdown-body hr {
    height: 1px;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }
  
  .back-button {
    display: inline-block;
    margin-bottom: 16px;
    padding: 8px 16px;
    background-color: #f1f1f1;
    color: #333;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
  }
  
  .back-button:hover {
    background-color: #ddd;
  }
  
  .error {
    background-color: #ffebee;
    color: #b71c1c;
    padding: 16px;
    border-radius: 4px;
  }
  
  /* 代码高亮样式 */
  .keyword {
    color: #0033b3;
    font-weight: bold;
  }
  
  .string {
    color: #067d17;
  }
`;

document.head.appendChild(style); 