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
const successModal = document.querySelector('[data-modal-success]');
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
  previousFocused: null,
};

// Event Listeners
header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
main.addEventListener('change', checkMainChange);
form.addEventListener('submit', verifyForm);
form.addEventListener('keypress', validateKeyPressed);

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

  if (target.hasAttribute('data-close-success') || target.hasAttribute('data-modal-success')) {
    return closeSuccessModal();
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
  focusable.previousFocused = button;
  document.addEventListener('keydown', verifyKeyDown);
  setFocusable(selectionModal);
  selectionModal.setAttribute('aria-hidden', false);
}

function closeSelectionModal() {
  const { previousFocused } = focusable;

  toggleActive(selectionModal);
  setClosing(selectionModal);
  previousFocused.focus();
  selectionModal.setAttribute('aria-hidden', true);
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
      isActive(successModal) || document.removeEventListener('keydown', verifyKeyDown);
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

// function setSelectionModalFocus() {
//   const button = document.querySelector('[data-close-selection]');
//   button.focus();
// }

function verifyKeyDown(evt) {
  if (evt.key === 'Tab') return changeModalFocus(evt);

  if (evt.key !== 'Escape') return;

  if (isActive(nav)) return toggleMobileMenu();

  if (isActive(selectionModal)) return closeSelectionModal();

  if (isActive(successModal)) return closeSuccessModal();
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
  const valueInput = item.querySelector('[data-number]');
  const { value } = valueInput;

  if (!validateMinValue(valueInput)) return;
  if (!validateInputValue(valueInput)) return;
  console.log('Valid amount!');
  const data = getData();
  updateProjectData(data, value, item.dataset);
  setBannerElementsData(data);
  setRewardCardData(data, item.dataset);
  closeSelectionModal();
  openSuccessModal();
}

function updateProjectData(data, value, { rewardItem }) {
  const { raisedTotal, rewards } = data;
  const { remainingTotal } = rewards[rewardItem];

  data.raisedTotal = calculateAmounts(raisedTotal, value);
  data.backersTotal++;
  data.rewards[rewardItem].remainingTotal = remainingTotal === 0 ? remainingTotal : remainingTotal - 1;
  localStorage[directory] = JSON.stringify(data);
}

function setBannerElementsData(data) {
  const raised = document.querySelector('[data-raised]');
  const backers = document.querySelector('[data-backers]');
  const barProgress = document.querySelector('[data-bar-progress]');
  const { raisedTotal, backersTotal } = data;
  const raisedInteger = parseInt(raisedTotal);
  const goal = 100000;
  const progress = raisedInteger >= goal ? '100%' : `${(raisedInteger / goal) * 100}%`;

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

function validateKeyPressed(evt) {
  const {
    key,
    code,
    target,
    target: { value },
  } = evt;
  const hasDot = value.includes(key);
  const fractionDigits = value.slice(value.indexOf('.'));

  if ((!isFinite(key) && key !== '.') || (key === '.' && hasDot) || code === 'Space' || fractionDigits.length > 2) {
    return evt.preventDefault();
  }

  if (target.classList.contains('invalid')) {
    const errorText = reward.item.querySelector('[data-invalid-value]');
    errorText.classList.add('hidden');
    target.classList.remove('invalid');
  }
}

function calculateAmounts(raisedValue, inputValue) {
  raisedValue = Number(raisedValue)
    .toFixed(2)
    .split('.')
    .map((value, index) => (index === 0 ? Number(value) : Number(value) / 100));
  inputValue = Number(inputValue)
    .toFixed(2)
    .split('.')
    .map((value, index) => (index === 0 ? Number(value) : Number(value) / 100));

  const integerTotal = raisedValue[0] + inputValue[0];
  const fractionalTotal = (raisedValue[1] * 100 + inputValue[1] * 100) / 100;
  const total = integerTotal + fractionalTotal;
  return total;
}

function validateInputValue(input) {
  const { value } = input;
  const regex = /^([1-9]\d*)(\.\d{0,2})?$/;
  const errorText = reward.item.querySelector('[data-invalid-value]');
  const hasInvalid = input.classList.contains('invalid');

  if (regex.test(value)) {
    if (hasInvalid) {
      errorText.classList.add('hidden');
      input.classList.remove('invalid');
      console.log('valid pledge');
    }
    return true;
  }

  if (!hasInvalid) {
    const { lastElementChild } = errorText;
    lastElementChild.innerText = `Enter a valid pledge!`;
    errorText.classList.remove('hidden');
    input.classList.add('invalid');
    console.log('invalid pledge');
  }
  return false;
}

function validateMinValue(evt) {
  const target = evt.target || evt;
  const { value, min } = target;
  const errorText = reward.item.querySelector('[data-invalid-value]');
  const hasInvalid = target.classList.contains('invalid');

  if (parseInt(value) < min || value === '') {
    if (!hasInvalid) {
      const { lastElementChild } = errorText;
      lastElementChild.innerText = `The minimum pledge for this reward is $${min}`;
      errorText.classList.remove('hidden');
      target.classList.add('invalid');
    }
    console.log('invalid min');
    return false;
  }

  if (parseInt(value) >= min) {
    if (hasInvalid) {
      errorText.classList.add('hidden');
      target.classList.remove('invalid');
    }
    console.log('valid min');
    return true;
  }
}

function openSuccessModal() {
  toggleActive(successModal);
  setFocusable(successModal);
  focusable.firstFocusable.focus();
  successModal.setAttribute('aria-hidden', false);
}

function closeSuccessModal() {
  toggleActive(successModal);
  setClosing(successModal);
  focusable.previousFocused.focus();
  successModal.setAttribute('aria-hidden', true);
}
