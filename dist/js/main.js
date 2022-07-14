const header = document.querySelector('[data-header]');
const main = document.querySelector('[data-main]');
const selectionModal = document.querySelector('[data-modal-selection]');
const form = document.querySelector('[data-form]');

header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
form.addEventListener('submit', evt => {
  evt.preventDefault();
});

function checkHeaderClick(evt) {
  const target = evt.target;

  if (target.matches('[data-toggle-menu]')) {
    return toggleMobileMenu();
  }
  if (target.matches('[data-overlay]')) {
    return toggleMobileMenu();
  }
}

function checkMainClick(evt) {
  const target = evt.target;

  if (target.matches('[data-button-bookmark]')) {
    return toggleBookmark();
  }
  if (target.matches('[data-cto-selection]')) {
    return openSelectionModal();
  }
  if (target.matches('[data-close-selection]')) {
    return closeSelectionModal();
  }
}

function toggleMobileMenu() {
  const nav = document.querySelector('[data-nav]');
  const button = document.querySelector('[data-toggle-menu]');

  toggleActiveClass([nav]);
  const isActive = nav.classList.contains('active');

  button.setAttribute('aria-expanded', isActive);
  button.setAttribute('aria-pressed', isActive);
  if (isActive) return;
  nav.classList.add('closing');
  nav.addEventListener(
    'animationend',
    evt => {
      evt.animationName === 'close-menu' && nav.classList.remove('closing');
    },
    { once: true }
  );
}

function toggleActiveClass(elements) {
  elements.forEach(element => element.classList.toggle('active'));
}

function toggleBookmark() {
  const isBookmarked = !JSON.parse(localStorage.getItem('bookmark'));
  const html = document.documentElement;

  localStorage.setItem('bookmark', isBookmarked);
  html.dataset.bookmark = isBookmarked;
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

function openSelectionModal() {
  toggleActiveClass([selectionModal]);
}

function closeSelectionModal() {
  toggleActiveClass([selectionModal]);
}
//# sourceMappingURL=main.js.map
