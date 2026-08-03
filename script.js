// Subtle scroll reveal for sections
const sections = document.querySelectorAll('.section');
sections.forEach(s => s.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach(s => observer.observe(s));
} else {
  sections.forEach(s => s.classList.add('is-visible'));
}
