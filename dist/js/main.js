const header = document.querySelector('[data-header]');
const main = document.querySelector('[data-main]');
const selectionModal = document.querySelector('[data-modal-selection]');
const form = document.querySelector('[data-form]');
const reward = {
  item: null,
  container: null,
  content: null,
  contentHeight: 0,
};
const observer = new ResizeObserver(verifyContentResize);

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

function checkMainChange({ target }) {
  if (target.hasAttribute('data-reward-radio')) {
    rewardSelected(target);
    return;
  }
}

// Mobile Navigation Menu
function toggleMobileMenu() {
  const nav = document.querySelector('[data-nav]');
  const button = document.querySelector('[data-toggle-menu]');

  toggleActive(nav);
  const isActive = nav.classList.contains('active');

  button.setAttribute('aria-expanded', isActive);
  button.setAttribute('aria-pressed', isActive);
  if (isActive) return;
  nav.classList.add('closing');
  nav.addEventListener('animationend', toggleClosing);
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
  toggleActive(selectionModal);
}

function closeSelectionModal() {
  toggleActive(selectionModal);
  selectionModal.classList.add('closing');
  selectionModal.addEventListener('animationend', toggleClosing);
}

function rewardSelected(target) {
  if (reward.item !== null) collapseContainer();
  setReward(target);
  expandContainer();
}

function setReward(radioInput) {
  reward.item = radioInput.closest('[data-reward-item]');
  reward.container = reward.item.querySelector('[data-wrapper-grow]');
  reward.content = reward.container.firstElementChild;
}

function expandContainer() {
  toggleActive(reward.item);
  setContainerHeight();
  setResizeObserver();
  toggleDisabled();
}

function collapseContainer() {
  toggleActive(reward.item);
  setContainerHeight(0);
  removeResizeObserver();
  toggleDisabled();
}

// Helpers
function toggleActive(element) {
  element.classList.toggle('active');
}

function toggleClosing() {
  this.classList.toggle('closing');
  this.removeEventListener('animationend', toggleClosing);
}

function setContainerHeight(height = getContentHeight()) {
  const { container } = reward;
  container.style.maxHeight = `${height}px`;
}

function getContentHeight() {
  const { height } = reward.content.getBoundingClientRect();
  reward.contentHeight = height;
  return height;
}

function verifyContentResize(entries) {
  const elementBlockSize = entries[0].borderBoxSize[0].blockSize;
  if (elementBlockSize === reward.contentHeight) return;
  setContainerHeight();
}

function setResizeObserver() {
  const { content } = reward;
  observer.observe(content);
}

function removeResizeObserver() {
  const { content } = reward;
  observer.unobserve(content);
}

function toggleDisabled() {
  const { content } = reward;
  const inputs = content.querySelectorAll('input');

  inputs.forEach(input => {
    input.toggleAttribute('disabled');
  });
}
//# sourceMappingURL=main.js.map
