const header = document.querySelector('[data-header]');
const main = document.querySelector('[data-main]');

header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);

function checkHeaderClick(evt) {
  const target = evt.target;

  if (target.matches('[data-toggle-menu]')) {
    return mobileMenu(target);
  }
}

function checkMainClick(evt) {
  const target = evt.target;

  if (target.matches('[data-button-bookmark]')) {
    return toggleBookmark();
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

function toggleBookmark() {
  const isBookmarked = JSON.parse(localStorage.getItem('bookmark'));
  const html = document.documentElement;

  localStorage.setItem('bookmark', !isBookmarked);
  html.dataset.bookmark = !isBookmarked;
  setToggleBookmarkAttributes();
}

setToggleBookmarkAttributes();
function setToggleBookmarkAttributes() {
  const isBookmarked = JSON.parse(localStorage.getItem('bookmark'));
  const button = document.querySelector('[data-button-bookmark]');

  button.setAttribute('aria-pressed', isBookmarked);
  if (isBookmarked) {
    button.setAttribute('aria-label', 'Remove bookmark');
  } else {
    button.setAttribute('aria-label', 'Add bookmark');
  }
}
