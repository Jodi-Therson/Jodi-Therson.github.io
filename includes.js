// Shared nav and footer
class SiteNav extends HTMLElement {
  connectedCallback() {
    const base = this.getAttribute('base') || '.';
    this.innerHTML = `
      <nav class="nav">
        <div class="nav-inner">
          <a href="${base}/index.html" class="nav-brand">Portfolio Website<span class="accent-dot">.</span></a>
          <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <ul class="nav-links" id="navLinks">
            <li><a href="${base}/index.html#about">About</a></li>
            <li><a href="${base}/index.html#experience">Experience</a></li>
            <li><a href="${base}/index.html#projects">Projects</a></li>
            <li><a href="${base}/index.html#skills">Skills</a></li>
            <li><a href="${base}/writing/index.html">Writing</a></li>
            <li><a href="${base}/index.html#contact">Contact</a></li>
          </ul>
        </div>
      </nav>
    `;

    // Re-wire the mobile menu toggle now that the nav exists in the DOM
    const navToggle = this.querySelector('#navToggle');
    const navLinks = this.querySelector('#navLinks');

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="footer">
        <p>&copy; ${new Date().getFullYear()} Built by Jodi Therson.</p>
      </footer>
    `;
  }
}

customElements.define('site-nav', SiteNav);
customElements.define('site-footer', SiteFooter);

// Table of contents + heading anchor links

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
 
function initTableOfContents() {
  const article = document.querySelector('.post-article');
  if (!article) return;
 
  // Guard: don't run twice on the same page (avoids duplicate # links / duplicate sidebar)
  if (document.querySelector('.toc')) return;
 
  const headings = article.querySelectorAll('h2, h3');
  if (headings.length === 0) return;
 
  const usedIds = new Set();
  const tocItems = [];
 
  headings.forEach(heading => {
    // Skip if this heading already has an anchor (safety net, shouldn't normally trigger)
    if (heading.querySelector('.heading-anchor')) return;
 
    let id = slugify(heading.textContent);
    let unique = id;
    let i = 2;
    while (usedIds.has(unique)) {
      unique = `${id}-${i}`;
      i++;
    }
    usedIds.add(unique);
    heading.id = unique;
 
    // Small clickable # link next to the heading itself
    const anchor = document.createElement('a');
    anchor.href = `#${unique}`;
    anchor.className = 'heading-anchor';
    anchor.setAttribute('aria-label', 'Link to this section');
    anchor.textContent = '#';
    heading.prepend(anchor);
 
    tocItems.push({
      id: unique,
      text: heading.textContent.replace(/^#/, '').trim(),
      level: heading.tagName.toLowerCase(), // 'h2' or 'h3'
    });
  });
 
  // Build the sidebar outline
  const toc = document.createElement('nav');
  toc.className = 'toc';
  toc.setAttribute('aria-label', 'Table of contents');
 
  const title = document.createElement('p');
  title.className = 'toc-title';
  title.textContent = 'Contents';
  toc.appendChild(title);
 
  const list = document.createElement('ul');
  tocItems.forEach(item => {
    const li = document.createElement('li');
    li.className = item.level === 'h3' ? 'toc-h3' : 'toc-h2';
 
    const marker = document.createElement('span');
    marker.className = 'toc-marker';
    marker.textContent = item.level === 'h3' ? '##' : '#';
 
    const link = document.createElement('a');
    link.href = `#${item.id}`;
    link.appendChild(marker);
    link.append(' ' + item.text);
 
    li.appendChild(link);
    list.appendChild(li);
  });
  toc.appendChild(list);
 
  document.body.appendChild(toc);
 
  // Highlight the current section as you scroll
  const tocLinks = toc.querySelectorAll('a');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const link = toc.querySelector(`a[href="#${entry.target.id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            tocLinks.forEach(l => l.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    headings.forEach(h => observer.observe(h));
  }
}
 
document.addEventListener('DOMContentLoaded', initTableOfContents);

// ===== Auto-escaping raw code blocks =====
function initRawCodeBlocks() {
  document.querySelectorAll('.code-embed').forEach(container => {
    const textarea = container.querySelector('textarea');
    if (!textarea) return;
 
    // Strip one leading/trailing blank line so indentation in the source
    // doesn't create an empty first/last line in the rendered block
    const raw = textarea.value.replace(/^\n/, '').replace(/\n\s*$/, '');
 
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = raw; // textContent auto-escapes < > & for safe display
    pre.appendChild(code);
 
    container.replaceWith(pre);
  });
}
 
document.addEventListener('DOMContentLoaded', initRawCodeBlocks);

// ===== Image lightbox =====
 
function initLightbox() {
  const article = document.querySelector('.post-article');
  if (!article) return;
 
  const images = article.querySelectorAll('img');
  if (images.length === 0) return;
 
  // Build the overlay once
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close image preview">&times;</button>
    <img class="lightbox-img" src="" alt="">
  `;
  document.body.appendChild(overlay);
 
  const overlayImg = overlay.querySelector('.lightbox-img');
  const closeBtn = overlay.querySelector('.lightbox-close');
 
  function openLightbox(img) {
    overlayImg.src = img.currentSrc || img.src;
    overlayImg.alt = img.alt || '';
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }
 
  function closeLightbox() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
 
  images.forEach(img => {
    img.classList.add('is-zoomable');
    img.addEventListener('click', () => openLightbox(img));
  });
 
  overlay.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', closeLightbox);
 
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}
 
document.addEventListener('DOMContentLoaded', initLightbox);