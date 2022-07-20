const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const main = document.querySelector('[data-main]');
const selectionModal = document.querySelector('[data-modal-selection]');
const form = document.querySelector('[data-form]');
const reward = {
  item: null,
  container: null,
  content: null,
  contentHeight: 0,
  previousFocused: null,
};
const observer = new ResizeObserver(verifyContentResize);

header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
main.addEventListener('change', checkMainChange);
form.addEventListener('submit', verifyForm);

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
    openSelectionModal(target);
    setSelectionModalFocus();
    return;
  }

  if (target.hasAttribute('data-close-selection') || target.hasAttribute('data-modal-selection')) {
    return closeSelectionModal();
  }

  if (target.hasAttribute('data-button-select')) {
    return selectedItem(target);
  }
}

function checkMainChange({ target }) {
  if (target.hasAttribute('data-reward-radio')) {
    return rewardSelected(target);
  }
}

// Mobile Navigation Menu
function toggleMobileMenu() {
  const button = document.querySelector('[data-toggle-menu]');

  toggleActive(nav);
  const isActive = hasActive(nav);

  button.setAttribute('aria-expanded', isActive);
  button.setAttribute('aria-pressed', isActive);
  isActive && document.addEventListener('keydown', verifyKeyDown);
  isActive || setClosing(nav);
}

// Bookmark Button
function toggleBookmark() {
  const isBookmarked = !getBookmarkData();
  const html = document.documentElement;

  setBookmarkData(isBookmarked);
  html.dataset.bookmark = isBookmarked;
  setToggleBookmarkAttributes();
}

function setBookmarkData(value) {
  const data = getData();
  data[directory].bookmark = value;
  localStorage['data'] = JSON.stringify(data);
}

function getBookmarkData() {
  const data = getData();
  return data[directory].bookmark;
}

setToggleBookmarkAttributes();
function setToggleBookmarkAttributes() {
  const isBookmarked = getBookmarkData();
  const button = document.querySelector('[data-button-bookmark]');

  button.setAttribute('aria-pressed', isBookmarked);
  if (isBookmarked) {
    button.setAttribute('aria-label', 'Remove bookmark');
  } else {
    button.setAttribute('aria-label', 'Add bookmark');
  }
}

// Selection Modal
function openSelectionModal(button) {
  toggleActive(selectionModal);
  reward.previousFocused = button;
  selectionModal.setAttribute('aria-hidden', false);
  document.addEventListener('keydown', verifyKeyDown);
}

function closeSelectionModal() {
  const { previousFocused } = reward;

  toggleActive(selectionModal);
  setClosing(selectionModal);
  selectionModal.setAttribute('aria-hidden', true);
  previousFocused.focus();
}

function rewardSelected(radioInput) {
  reward.item && collapseContainer();
  setReward(radioInput);
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

function selectedItem(button) {
  const value = button.dataset.buttonSelect;
  const item = document.querySelector(`[data-reward-item='${value}']`);
  const radioInput = item.querySelector('[data-reward-radio]');

  openSelectionModal(button);
  radioInput.checked = true;
  radioInput.focus();
  rewardSelected(radioInput);
}

// Helpers
function toggleActive(element) {
  element.classList.toggle('active');
}

function setClosing(element) {
  element.classList.add('closing');
  element.addEventListener(
    'animationend',
    () => {
      element.classList.remove('closing');
      document.removeEventListener('keydown', verifyKeyDown);
      // reward.item && resetSelectionModal();
    },
    { once: true }
  );
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

function resetReward() {
  for (const key in reward) {
    if (isNaN(reward[key])) {
      reward[key] = null;
      continue;
    }
    reward[key] = 0;
  }
}

function resetSelectionModal() {
  collapseContainer();
  resetReward();
  form.reset();
}

function setSelectionModalFocus() {
  const button = document.querySelector('[data-close-selection]');
  button.focus();
}

function verifyKeyDown({ key }) {
  if (key !== 'Escape') return;

  if (hasActive(nav)) return toggleMobileMenu();

  if (hasActive(selectionModal)) return closeSelectionModal();
}

function hasActive(element) {
  return element.classList.contains('active');
}

function verifyForm(evt) {
  console.log(evt);
  evt.preventDefault();
}
