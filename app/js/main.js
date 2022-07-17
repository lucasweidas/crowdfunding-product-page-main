const header = document.querySelector('[data-header]');
const main = document.querySelector('[data-main]');
const selectionModal = document.querySelector('[data-modal-selection]');
const form = document.querySelector('[data-form]');
const rewardItem = {
  selectedItem: null,
  previousItem: null,
  isActive: false,
  wrapperGrow: null,
  growChild: null,
  childHeight: 0,
};

header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
main.addEventListener('change', checkMainChange);
form.addEventListener('submit', evt => {
  evt.preventDefault();
});

function checkHeaderClick({ target }) {
  if (target.hasAttribute('data-toggle-menu') || target.hasAttribute('data-overlay')) {
    return toggleMobileMenu();
  }
}

function checkMainClick({ target }) {
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

function checkMainChange(evt) {
  const { target } = evt;
  if (target.hasAttribute('data-reward-radio')) {
    rewardRadioSelected(target);
    console.log(target.checked);
  }
}

// Mobile Navigation Menu
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

// Bookmark Button
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

// Selection Modal
function openSelectionModal() {
  toggleActiveClass(selectionModal);
  window.addEventListener('resize', setElementHeight);
}

function closeSelectionModal() {
  toggleActiveClass(selectionModal);
  selectionModal.classList.add('closing');
  selectionModal.addEventListener('animationend', toggleClosingClass);
}

function rewardRadioSelected(radioButton) {
  rewardItem.selectedItem = getParent(radioButton, 'data-reward-item');
  rewardItem.previousItem = rewardItem.selectedItem;
  rewardItem.isActive = true;
  rewardItem.wrapperGrow = rewardItem.selectedItem.querySelector('[data-wrapper-grow]');
  rewardItem.growChild = rewardItem.wrapperGrow.firstElementChild;
  console.log(rewardItem.growChild);

  toggleActiveClass(rewardItem.selectedItem);
  setElementHeight();
  console.log(rewardItem.wrapperGrow);
}

// Helpers
function toggleActiveClass(element) {
  element.classList.toggle('active');
}

function toggleClosingClass() {
  this.classList.toggle('closing');
  this.removeEventListener('animationend', toggleClosingClass);
}

function getParent(element, attribute) {
  const parent = element.parentElement;
  if (parent.hasAttribute(attribute)) return parent;
  return getParent(parent, attribute);
}

function setElementHeight() {
  const height = rewardItem.growChild.offsetHeight;
  rewardItem.childHeight = height;

  if (rewardItem.isActive) {
    rewardItem.wrapperGrow.style.maxHeight = `${height}px`;
  } else {
    rewardItem.wrapperGrow.style.maxHeight = '0px';
  }
}
