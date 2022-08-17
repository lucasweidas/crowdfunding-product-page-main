// Global Variables
const header = document.querySelector('[data-header]');
const nav = document.querySelector('[data-nav]');
const main = document.querySelector('[data-main]');
const selectionModal = document.querySelector('[data-modal-selection]');
const successModal = document.querySelector('[data-modal-success]');
const selectionForm = document.querySelector('[data-form]');
const reward = {
  item: null,
  container: null,
  content: null,
  contentHeight: 0,
};
const focusable = {
  firstFocusable: null,
  focusableContent: null,
  lastFocusable: null,
  previousFocused: null,
};
const observer = new ResizeObserver(verifyContentResize);

// Initializer
(() => {
  const data = getData();
  const items = document.querySelectorAll('[data-reward-item]');

  setToggleBookmarkAttributes(data);
  setBannerElementsData(data);
  items.forEach(item => setRewardCardData(data, item));
})();

// Event Listeners
header.addEventListener('click', checkHeaderClick);
main.addEventListener('click', checkMainClick);
main.addEventListener('change', checkMainChange);
selectionForm.addEventListener('submit', verifyForm);
setFormFilterEvents(selectionForm);

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
    return rewardSelected(target);
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
  document.body.classList.add('fixed');
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
  toggleTabindex(radioInput);
  reward.item && collapseContainer();
  setReward(radioInput);
  expandContainer();
  addFormInputsEvents(reward.item.querySelector('[data-number]'));
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

  // toggleTabindex(radioInput);
  openSelectionModal(button);
  radioInput.checked = true;
  radioInput.focus();
  rewardSelected(radioInput);
}

// Sucess Modal
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
      reward.item && resetSelectionModal();
      if (isActive(successModal)) return;
      document.body.classList.remove('fixed');
      document.removeEventListener('keydown', verifyKeyDown);
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
  const numberInputs = document.querySelectorAll('[data-number].invalid');
  const errorTexts = document.querySelectorAll('[data-invalid-value]:not(.hidden)');

  collapseContainer();
  resetReward();
  selectionForm.reset();
  removeFormInputsEvents();
  for (let index = 0; index < numberInputs.length; index++) {
    removeValueAlerts(numberInputs[index], errorTexts[index]);
  }
}

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

function setFocusable(element) {
  const focusableElements = 'button:not([disabled]), input:not([disabled]):not([tabindex="-1"])';
  const elements = element.querySelectorAll(focusableElements);

  focusable.firstFocusable = elements[0];
  focusable.focusableContent = elements;
  focusable.lastFocusable = elements[elements.length - 1];
}

function toggleTabindex(target) {
  const radios = [...selectionForm.querySelectorAll('[data-reward-radio]')];
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

  const { item } = reward;
  const valueInput = item.querySelector('[data-number]');
  const value = removeCommas(valueInput.value);

  if (!validateInputValue(valueInput, value)) return;
  if (!validateMinValue(valueInput, value)) return;
  console.log('Valid amount!');
  const data = getData();
  updateProjectData(data, value, item.dataset);
  setBannerElementsData(data);
  setRewardCardData(data, item);
  closeSelectionModal();
  openSuccessModal();
}

function updateProjectData(data, value, { rewardItem }) {
  const { raisedTotal, rewards } = data;
  const { remainingTotal } = rewards[rewardItem];

  data.raisedTotal = calculateAmounts(raisedTotal, value);
  data.backersTotal++;
  data.rewards[rewardItem].remainingTotal = remainingTotal <= 0 ? remainingTotal : remainingTotal - 1;
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

function setRewardCardData(data, item) {
  const { rewardItem } = item.dataset;
  if (rewardItem === '0') return;

  const selectors = `[data-reward-banner='${rewardItem}'] [data-remaining], [data-reward-item='${rewardItem}'] [data-remaining]`;
  const remainings = document.querySelectorAll(selectors);
  const { remainingTotal } = data.rewards[rewardItem];

  remainings.forEach(remaining => {
    remaining.innerText = remainingTotal;

    const disabled = item.classList.contains('disabled');
    if (remainingTotal <= 0 && !disabled) disableRewardCard(item, rewardItem);
  });
}

function disableRewardCard(item, rewardItem) {
  const banner = document.querySelector(`[data-reward-banner='${rewardItem}']`);

  item.classList.add('disabled');
  banner.classList.add('disabled');
  setFocusable(banner);
  focusable.focusableContent.forEach(element => {
    element.toggleAttribute('disabled');
    if (!element.hasAttribute('data-button-select')) return;
    element.innerText = 'Out of Stock';
  });
  setFocusable(item);
  focusable.focusableContent.forEach(element => element.toggleAttribute('disabled'));
}

function setFormFilterEvents(form) {
  // const events = ['input', 'keydown', 'keyup'];
  const events = ['input'];

  events.forEach(event => {
    form.addEventListener(event, verifySelectionFormEvents);
  });
}

function addFormInputsEvents(input) {
  input.addEventListener('blur', formInputEvents);
  input.addEventListener('focus', formInputEvents);
}

function removeFormInputsEvents() {
  const valueInputs = document.querySelectorAll('[data-number]');

  valueInputs.forEach(input => {
    input.removeEventListener('blur', formInputEvents);
    input.removeEventListener('focus', formInputEvents);
  });
}

function verifySelectionFormEvents({ target, type }) {
  if (target.type !== 'text' || type !== 'input') return;

  filterInputValue(target, /^\d*(\.\d{0,2})?$/) && removeValueAlerts(target);
}

function formInputEvents({ target, type }) {
  if (type === 'blur') {
    target.value = toCurrency(target.value);
    return;
  }
  if (type === 'focus') {
    target.value = removeCommas(target.value);
    return;
  }
}

function filterInputValue(input, filter) {
  if (filter.test(input.value)) {
    input.oldValue = input.value;
    input.oldSelectionStart = input.selectionStart;
    input.oldSelectionEnd = input.selectionEnd;
    // console.log("1");
    return true;
  } else if (input.hasOwnProperty('oldValue')) {
    input.value = input.oldValue;
    input.setSelectionRange(input.oldSelectionStart, input.oldSelectionEnd);
    // console.log("2");
    return false;
  } else {
    input.value = '';
    // console.log("3");
    return false;
  }
}

function toCurrency(value) {
  const regex = /^(?![\s\S])|^\.\d{0,2}?$/;
  if (regex.test(value)) return value;

  const minimum = /\./.test(value) ? value.split('.')[1].length : 0;
  const formattedValue = Intl.NumberFormat('en-US', {
    minimumFractionDigits: minimum,
  }).format(Number(removeCommas(value)));

  // return /\.$/.test(value) ? `${formattedValue}.` : formattedValue;
  return formattedValue;
}

function removeCommas(value) {
  return value.replace(/,/g, '');
}

function calculateAmounts(raisedValue, inputValue) {
  raisedValue = getIntergerAndFractionalDigits(raisedValue);
  inputValue = getIntergerAndFractionalDigits(removeCommas(inputValue));
  // console.log(raisedValue, inputValue);

  const integerTotal = raisedValue[0] + inputValue[0];
  const fractionalTotal = (raisedValue[1] * 100 + inputValue[1] * 100) / 100;
  const total = integerTotal + fractionalTotal;
  return total;
}

function getIntergerAndFractionalDigits(value) {
  return Number(value)
    .toFixed(2)
    .split('.')
    .map((value, index) => (index === 0 ? Number(value) : Number(value) / 100));
}

function validateInputValue(input, value) {
  const filter = /^0{1,2}(\.\d{0,2})?$/;
  const filter2 = /^(?![\s\S])|^\.$/;
  if (filter.test(value) || !filter2.test(value)) return true;

  const errorText = reward.item.querySelector('[data-invalid-value]');
  const message = `Enter a valid pledge`;
  addValueAlerts(input, errorText, message);
  console.log('invalid pledge');
  return false;
}

function validateMinValue(input, value) {
  const { min } = input;
  if (Number(value) >= min) return true;

  const errorText = reward.item.querySelector('[data-invalid-value]');
  const message = `The minimum pledge for this reward is $${min}`;
  addValueAlerts(input, errorText, message);
  console.log('invalid min');
  return false;
}

function addValueAlerts(input, errorText, message) {
  const hasInvalid = input.classList.contains('invalid');
  if (hasInvalid) return;

  const { lastElementChild } = errorText;
  lastElementChild.innerText = message;
  errorText.classList.remove('hidden');
  input.classList.add('invalid');
}

function removeValueAlerts(input, errorText) {
  input = input.target || input;
  const hasInvalid = input.classList.contains('invalid');
  if (!hasInvalid) return;

  errorText = errorText || reward.item.querySelector('[data-invalid-value]');
  errorText.classList.add('hidden');
  input.classList.remove('invalid');
}
//# sourceMappingURL=main.js.map
