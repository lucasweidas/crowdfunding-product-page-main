// Initializer
(() => {
  const data = getData();
  const items = document.querySelectorAll('[data-reward-item]');

  setToggleBookmarkAttributes(data);
  setBannerElementsData(data);
  items.forEach(item => {
    const disabled = item.classList.contains('disabled');
    setRewardCardData(data, item.dataset, disabled);
  });
})();

// Global Variables
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
const focusable = {
  firstFocusable: null,
  focusableContent: null,
  lastFocusable: null,
};

// Event Listeners
header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
main.addEventListener('change', checkMainChange);
form.addEventListener('submit', verifyForm);
form.addEventListener('keypress', validateInputValue);

// Event Checkers
function checkHeaderClick({ target }) {
  if (target.hasAttribute('data-toggle-menu') || target.hasAttribute('data-overlay')) {
    return toggleMobileMenu();
  }
}

function checkMainClick({ target }) {
  isActive(nav) && toggleActive(nav);

  if (target.hasAttribute('data-button-bookmark')) {
    return toggleBookmark();
  }

  if (target.hasAttribute('data-cto-selection')) {
    toggleTabindex();
    openSelectionModal(target);
    focusable.firstFocusable.focus();
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
    toggleTabindex(target);
    rewardSelected(target);
    return;
  }
}

// Mobile Menu Navigation
function toggleMobileMenu() {
  toggleActive(nav);
  const button = document.querySelector('[data-toggle-menu]');
  const active = isActive(nav);

  button.setAttribute('aria-expanded', active);
  button.setAttribute('aria-pressed', active);
  active && document.addEventListener('keydown', verifyKeyDown);
  active || setClosing(nav);
}

// Bookmark Button
function toggleBookmark() {
  const bookmarked = !getData().bookmarked;
  const html = document.documentElement;

  setBookmarkData(bookmarked);
  html.dataset.bookmark = bookmarked;
  setToggleBookmarkAttributes();
}

function setBookmarkData(value) {
  const data = getData();
  data.bookmarked = value;
  localStorage[directory] = JSON.stringify(data);
}

function setToggleBookmarkAttributes() {
  const { bookmarked } = getData();
  const button = document.querySelector('[data-button-bookmark]');

  button.setAttribute('aria-pressed', bookmarked);
  if (bookmarked) {
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
  setFocusable(selectionModal);
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
  setFocusable(selectionModal);
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

  toggleTabindex(radioInput);
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
      reward.item && resetSelectionModal();
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

function verifyKeyDown(evt) {
  if (evt.key === 'Tab') return changeModalFocus(evt);

  if (evt.key !== 'Escape') return;

  if (isActive(nav)) return toggleMobileMenu();

  if (isActive(selectionModal)) return closeSelectionModal();
}

function changeModalFocus(evt) {
  const { firstFocusable, lastFocusable } = focusable;
  const { activeElement } = document;
  const { shiftKey } = evt;

  // if shift + tab and first focusable element
  if (shiftKey && activeElement === firstFocusable) {
    lastFocusable.focus();
    return evt.preventDefault();
  }
  // if only tab and last focusable element
  if (!shiftKey && activeElement === lastFocusable) {
    firstFocusable.focus();
    evt.preventDefault();
  }
}

function setFocusable(modal) {
  const focusableElements = 'button:not([disabled]), input:not([disabled]):not([tabindex="-1"])';
  const elements = modal.querySelectorAll(focusableElements);
  focusable.firstFocusable = elements[0];
  focusable.focusableContent = elements;
  focusable.lastFocusable = elements[elements.length - 1];
}

function toggleTabindex(target) {
  const radios = [...form.querySelectorAll('[data-reward-radio]')];
  target = target || radios[0];

  radios.forEach(radio => {
    if (radio === target) {
      return target.removeAttribute('tabindex');
    }
    radio.setAttribute('tabindex', '-1');
  });
}

function isActive(element) {
  return element.classList.contains('active');
}

function verifyForm(evt) {
  evt.preventDefault();
  // const { submitter } = evt;
  const { item } = reward;
  const numberInput = item.querySelector('[data-number]');
  const { value } = numberInput;
  const regex = /^([1-9]\d*)(\.\d{0,2})?$/;

  console.log(regex.test(value));
  if (!regex.test(value)) return;
  const data = getData();
  updateProjectData(data, Number(value), item.dataset);
  setBannerElementsData(data);
  setRewardCardData(data, item.dataset);
}

function updateProjectData(data, value, { rewardItem }) {
  const { raisedTotal, rewards } = data;
  const { remainingTotal } = rewards[rewardItem];
  // let dotIndex = String(raisedTotal).indexOf('.');
  // const remainingInteger = Number(String(raisedTotal).slice(0, dotIndex));
  // const remainingFractional = Number(String(raisedTotal).slice(dotIndex));
  // dotIndex = String(value).indexOf('.');
  // const valueInteger = Number(String(value).slice(0, dotIndex));
  // const valueFractional = Number(String(value).slice(dotIndex));
  // const fractionalTotal = (remainingFractional * 100 + valueFractional * 100) / 100;
  // const integerTotal = remainingInteger + valueInteger;
  // const newRaisedTotal = integerTotal + fractionalTotal;

  // data.raisedTotal = newRaisedTotal;
  data.raisedTotal = raisedTotal + value;
  data.backersTotal++;
  data.rewards[rewardItem].remainingTotal = remainingTotal === 0 ? remainingTotal : remainingTotal - 1;
  localStorage[directory] = JSON.stringify(data);
}

function setBannerElementsData(data) {
  const { raisedTotal, backersTotal } = data;
  const raised = document.querySelector('[data-raised]');
  const backers = document.querySelector('[data-backers]');
  const barProgress = document.querySelector('[data-bar-progress]');
  const progress = raisedTotal >= 100000 ? '100%' : `${(raisedTotal / 100000) * 100}%`;

  raised.innerText = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(raisedTotal);
  backers.innerText = Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(backersTotal);
  barProgress.style.width = progress;
}

function setRewardCardData(data, { rewardItem }, disabled) {
  if (rewardItem === '0' || disabled) return;
  const selectors = `[data-reward-banner='${rewardItem}'] [data-remaining], [data-reward-item='${rewardItem}'] [data-remaining]`;
  const remainings = document.querySelectorAll(selectors);
  const { remainingTotal } = data.rewards[rewardItem];

  remainings.forEach(remaining => {
    remaining.innerText = remainingTotal;
    remaining.dataset.remaining = remainingTotal;
  });
}

function validateInputValue(evt) {
  const {
    key,
    target: { value },
  } = evt;
  const hasDot = value.includes(key);
  const fractionDigits = value.slice(value.indexOf('.'));

  if ((!isFinite(key) && key !== '.') || (key === '.' && hasDot) || fractionDigits.length > 2) {
    return evt.preventDefault();
  }
}
//# sourceMappingURL=main.js.map
