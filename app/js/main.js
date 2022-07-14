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

  if (target.hasAttribute('data-toggle-menu') || target.hasAttribute('data-overlay')) {
    return toggleMobileMenu();
  }
  // if (target.hasAttribute('data-overlay')) {
  //   return toggleMobileMenu();
  // }
}

function checkMainClick(evt) {
  const target = evt.target;

  if (target.hasAttribute('data-button-bookmark')) {
    return toggleBookmark();
  }
  if (target.hasAttribute('data-cto-selection')) {
    return openSelectionModal();
  }
  if (target.hasAttribute('data-close-selection')) {
    return closeSelectionModal();
  }
  if (target.hasAttribute('data-modal-selection')) {
    return closeSelectionModal();
  }
}

function toggleMobileMenu() {
  const nav = document.querySelector('[data-nav]');
  const button = document.querySelector('[data-toggle-menu]');

  toggleActiveClass(nav);
  const isActive = nav.classList.contains('active');

  button.setAttribute('aria-expanded', isActive);
  button.setAttribute('aria-pressed', isActive);
  if (isActive) return;
  nav.classList.add('closing');
  nav.addEventListener('animationend', toggleClosingClass);
}

function toggleActiveClass(element) {
  element.classList.toggle('active');
}

function toggleClosingClass() {
  this.classList.toggle('closing');
  this.removeEventListener('animationend', toggleClosingClass);
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
  toggleActiveClass(selectionModal);
}

function closeSelectionModal() {
  toggleActiveClass(selectionModal);
  selectionModal.classList.add('closing');
  selectionModal.addEventListener('animationend', toggleClosingClass);
}
