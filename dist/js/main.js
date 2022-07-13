const header = document.querySelector('[data-header]');
const toggleMenu = document.querySelector('[data-toggle-menu]');

header.addEventListener('click', checkHeaderClick);

function checkHeaderClick(evt) {
  const target = evt.target;

  if (target.matches('[data-toggle-menu]')) {
    return mobileMenu(target);
  }
}

function mobileMenu(button) {
  const menu = document.querySelector('[data-nav-menu]');

  toggleActiveClass([menu, button]);
  const isActive = menu.classList.contains('active');
  button.setAttribute('aria-expanded', isActive);
  button.setAttribute('aria-pressed', isActive);
  if (!isActive) {
    menu.classList.add('closing');
    menu.addEventListener(
      'animationend',
      () => {
        menu.classList.remove('closing');
      },
      { once: true }
    );
  }
}

function toggleActiveClass(elements) {
  elements.forEach(element => element.classList.toggle('active'));
}
//# sourceMappingURL=main.js.map
