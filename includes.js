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
