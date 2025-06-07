import { findHtmlElement } from '../helpers.js';

const defaultParams = {
  containerClass: 'custom-select',
  openerClass: 'custom-select__opener',
  slideLabelClass: 'custom-select__slide-label',
  panelClass: 'custom-select__panel',
  selectClass: 'custom-select__select-field',
  optionClass: 'custom-select__option',
  optgroupClass: 'custom-select__optgroup',
  expandIconClass: 'custom-select__expand-icon',
  isSelectedClass: 'custom-select__option--is-selected',
  hasFocusClass: 'custom-select__option--has-focus',
  isDisabledClass: 'custom-select--is-disabled',
  isOpenClass: 'custom-select--is-open',
  svgIconMarkup: '',
};

export class CustomSelect {
  params;
  selectElement;
  containerElement;
  panelElement;
  openerElement;
  openerLabelElement;
  selectedElement = null;
  focusedElement = null;
  initSelectClass;
  isOpen = false;
  uId = '';
  clickHandler = this.clickEvent.bind(this);
  mouseoverHandler = this.mouseoverEvent.bind(this);
  focusedHandler = this.scrollToFocused.bind(this);
  changeHandler = this.changeEvent.bind(this);
  keydownHandler = this.keydownEvent.bind(this);

  constructor(element, customParams) {
    if (element instanceof HTMLSelectElement) {
      this.selectElement = element;
    } else {
      const result = findHtmlElement(element);
      if (result instanceof HTMLSelectElement) {
        this.selectElement = result;
      } else {
        throw new Error(`selector ${element} can't find element width select tag`);
      }
    }

    this.params = Object.assign({}, defaultParams, customParams);
    this.initSelectClass = Array.from(this.selectElement.classList);
    this.selectElement.classList.add(this.params.selectClass);
    this.selectElement.classList.remove(...this.initSelectClass);

    this.uId = this.generateComponentId();

    this.containerElement = this.createContainerElement();
    this.openerLabelElement = this.createOpenerLabelElement();
    this.openerElement = this.createOpenerElement();
    this.panelElement = this.createPanelElement();

    this.append(this.selectElement.children, this.selectElement, false);
    this.injectWrapper();
    this.addAriaAttToLabel();
    this.switchComponentPulpability();
    this.setCustomSelectSize();
  }

  injectWrapper() {
    this.containerElement.appendChild(this.openerElement);
    const selectParent = this.selectElement.parentNode;
    selectParent?.replaceChild(this.containerElement, this.selectElement);
    this.containerElement.appendChild(this.selectElement);
    this.containerElement.appendChild(this.panelElement);
  }

  switchComponentPulpability() {
    if (this.selectElement.disabled) {
      this.containerElement.classList.add(this.params.isDisabledClass);
    } else {
      this.openerElement.setAttribute('tabindex', '0');
      this.selectElement.setAttribute('tabindex', '-1');
      this.addEvents();
    }
  }

  addAriaAttToLabel() {
    const selectParent = this.selectElement.parentNode;
    let currLabel = null;
    const label = document.querySelector(`label[for="${this.selectElement.id}"]`);
    if (label) {
      currLabel = label;
    }
    if (selectParent instanceof HTMLLabelElement) {
      currLabel = selectParent;
    }
    if (currLabel) {
      currLabel.setAttribute('id', `${this.params.containerClass}-${this.uId}-label`);
      this.openerElement.setAttribute('aria-labelledby', `${this.params.containerClass}-${this.uId}-label`);
    }
  }

  createPanelElement() {
    const element = document.createElement('div');
    element.id = `${this.params.containerClass}-${this.uId}-panel`;
    element.className = this.params.panelClass;
    element.setAttribute('role', 'listbox');
    element.setAttribute('aria-owns', element.id);
    return element;
  }

  generateComponentId() {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return result;
  }

  createContainerElement() {
    const element = document.createElement('div');
    element.classList.add(this.params.containerClass, ...this.initSelectClass);
    return element;
  }

  setOpenerLabel(labelElement, textContent) {
    labelElement.dataset.label = textContent;
    labelElement.children[0].textContent = textContent;
  }

  createOpenerLabelElement() {
    const element = document.createElement('span');
    element.classList.add(this.params.slideLabelClass);
    const allyLabel = document.createElement('span');
    allyLabel.classList.add('visually-hidden');
    element.append(allyLabel);
    return element;
  }

  createOpenerElement() {
    const element = document.createElement('span');
    element.className = this.params.openerClass;
    element.setAttribute('role', 'combobox');
    element.setAttribute('aria-autocomplete', 'list');
    element.setAttribute('aria-expanded', 'false');
    const labelTextContent =
      this.selectElement.selectedIndex !== -1 ? this.selectElement.options[this.selectElement.selectedIndex].text : '';
    element.append(this.openerLabelElement);
    this.setOpenerLabel(this.openerLabelElement, labelTextContent);

    const span = document.createElement('span');
    if (this.params.svgIconMarkup === '') {
      span.innerHTML = `<svg viewBox="0 0 100 100">
       <polygon points="0,0 100,0 50,100" />
     </svg>`;
    } else {
      span.innerHTML = this.params.svgIconMarkup;
    }
    const svg = span.lastElementChild;
    svg?.classList.add(this.params.expandIconClass);
    svg && element.append(svg);

    return element;
  }

  insertBefore(node, targetPar) {
    let target;
    if (targetPar instanceof HTMLOptionElement && this.selectElement.contains(targetPar)) {
      target = targetPar.customSelectCstOption;
    }
    if (targetPar instanceof HTMLOptGroupElement && this.selectElement.contains(targetPar)) {
      target = targetPar.customSelectCstOptgroup;
    }

    const markupToInsert = this.parseMarkup(node instanceof HTMLCollection ? node : [node]);

    target?.parentNode?.insertBefore(markupToInsert[0], target);
    return targetPar.parentNode?.insertBefore(node instanceof HTMLCollection ? node[0] : node, targetPar);
  }

  remove(node) {
    let cstNode;
    if (node instanceof HTMLOptionElement && this.selectElement.contains(node)) {
      cstNode = node.customSelectCstOption;
    }
    if (node instanceof HTMLOptGroupElement && this.selectElement.contains(node)) {
      cstNode = node.customSelectCstOptgroup;
    }
    cstNode?.remove();
    node.remove();
    this.changeEvent();
  }

  empty() {
    const removed = [];
    while (this.selectElement.children.length) {
      this.panelElement.removeChild(this.panelElement.children[0]);
      removed.push(this.selectElement.removeChild(this.selectElement.children[0]));
    }
    this.setSelectedElement();
    return removed;
  }

  destroy() {
    for (let i = 0, l = this.selectElement.options.length; i < l; i++) {
      delete this.selectElement.options[i].customSelectCstOption;
    }
    const optGroup = this.selectElement.getElementsByTagName('optgroup');
    for (let i = 0, l = optGroup.length; i < l; i++) {
      delete optGroup[i].customSelectCstOptgroup;
    }

    this.removeEvents();

    const outerElement = this.containerElement.parentNode;
    if (outerElement) {
      outerElement.replaceChild(this.selectElement, this.containerElement);
    }

    this.selectElement.classList.remove(this.params.selectClass);
    this.selectElement.classList.add(...this.initSelectClass);
  }

  set value(value) {
    this.setValue(value);
  }

  get value() {
    return this.selectElement.value;
  }

  setValue(value) {
    let toSelect = this.selectElement.querySelector(`option[value='${value}']`);
    if (!toSelect) {
      [toSelect] = Array.from(this.selectElement.options);
    }
    if (!(toSelect instanceof HTMLOptionElement)) return;
    toSelect.selected = true;

    const optionElement = this.selectElement.options[this.selectElement.selectedIndex].customSelectCstOption;

    this.setSelectedElement(optionElement);
  }

  removeEvents() {
    document.removeEventListener('click', this.clickHandler);
    this.panelElement.removeEventListener('mouseover', this.mouseoverHandler);
    this.panelElement.removeEventListener('custom-select:focus-outside-panel', this.focusedHandler);
    this.selectElement.removeEventListener('change', this.changeHandler);
    this.containerElement.removeEventListener('keydown', this.keydownHandler);
  }

  get disabled() {
    return this.selectElement.disabled;
  }

  set disabled(predicate) {
    if (predicate && !this.selectElement.disabled) {
      this.containerElement.classList.add(this.params.isDisabledClass);
      this.selectElement.disabled = true;
      this.openerElement.removeAttribute('tabindex');
      this.containerElement.dispatchEvent(new CustomEvent('custom-select:disabled'));
      this.removeEvents();
    } else if (!predicate && this.selectElement.disabled) {
      this.containerElement.classList.remove(this.params.isDisabledClass);
      this.selectElement.disabled = false;
      this.openerElement.setAttribute('tabindex', '0');
      this.containerElement.dispatchEvent(new CustomEvent('custom-select:enabled'));
      this.addEvents();
    }
  }

  append(elements, targetPar, appendIntoOriginal = true) {
    let target;
    if (typeof targetPar === 'undefined' || targetPar === this.selectElement) {
      target = this.panelElement;
    } else if (targetPar instanceof HTMLOptGroupElement && this.selectElement.contains(targetPar)) {
      target = targetPar?.customSelectCstOptgroup;
    } else {
      throw new TypeError('Invalid Argument');
    }

    const node = elements instanceof HTMLElement ? [elements] : elements;
    if (appendIntoOriginal) {
      for (let i = 0, l = node.length; i < l; i++) {
        if (target === this.panelElement) {
          this.selectElement.appendChild(node[i]);
        } else {
          target?.customSelectOriginalOptgroup.appendChild(node[i]);
        }
      }
    }

    const markupToInsert = this.parseMarkup(node);
    for (let i = 0, l = markupToInsert.length; i < l; i++) {
      target?.appendChild(markupToInsert[i]);
    }

    return node;
  }

  parseMarkup(children) {
    const nodeList = children;
    const cstList = [];

    for (let i = 0, li = nodeList.length; i < li; i++) {
      const element = nodeList[i];
      if (element instanceof HTMLOptGroupElement) {
        const div = document.createElement('div');
        div.classList.add(this.params.optgroupClass);
        div.setAttribute('data-label', element.label);
        const cstOptgroup = Object.assign(div, { customSelectOriginalOptgroup: element });
        Object.assign(element, { customSelectCstOptgroup: cstOptgroup });

        const subNodes = this.parseMarkup(element.children);
        for (let j = 0, lj = subNodes.length; j < lj; j++) {
          div.appendChild(subNodes[j]);
        }

        cstList.push(cstOptgroup);
      }
      if (element instanceof HTMLOptionElement) {
        const div = document.createElement('div');
        div.classList.add(this.params.optionClass);
        element.hasAttribute('disabled') && div.classList.add(this.params.isDisabledClass);
        div.textContent = element.text;
        div.setAttribute('data-value', element.value);
        div.setAttribute('role', 'option');
        const cstOption = Object.assign(div, { customSelectOriginalOption: element });
        Object.assign(element, { customSelectCstOption: cstOption });
        if (element.selected) {
          this.setSelectedElement(div);
        }
        cstList.push(cstOption);
      }
    }
    return cstList;
  }

  setCustomSelectSize() {
    const styles = window.getComputedStyle(this.openerElement);
    this.selectElement.style.border = styles.border;
    this.selectElement.style.padding = styles.padding;
  }

  setSelectedElement(cstOption) {
    if (this.selectedElement) {
      this.selectedElement.classList.remove(this.params.isSelectedClass);
      this.selectedElement.removeAttribute('id');
      this.openerElement.removeAttribute('aria-activedescendant');
    }
    if (cstOption) {
      cstOption.classList.add(this.params.isSelectedClass);
      cstOption.setAttribute('id', `${this.params.containerClass}-${this.uId}-selectedOption`);
      this.openerElement.setAttribute(
        'aria-activedescendant',
        `${this.params.containerClass}-${this.uId}-selectedOption`
      );
      this.selectedElement = cstOption;
      this.setOpenerLabel(this.openerLabelElement, this.selectedElement.customSelectOriginalOption.text);
    } else {
      this.selectedElement = null;
      this.setOpenerLabel(this.openerLabelElement, '');
    }
    this.setFocusedElement(cstOption);
  }

  setFocusedElement(cstOption) {
    if (this.focusedElement) {
      this.focusedElement.classList.remove(this.params.hasFocusClass);
    }
    if (cstOption) {
      this.focusedElement = cstOption;
      this.focusedElement.classList.add(this.params.hasFocusClass);
      if (
        this.isOpen &&
        cstOption.offsetParent &&
        (cstOption.offsetTop < cstOption.offsetParent.scrollTop ||
          cstOption.offsetTop >
            cstOption.offsetParent.scrollTop + cstOption.offsetParent.clientHeight - cstOption.clientHeight)
      ) {
        cstOption.dispatchEvent(new CustomEvent('custom-select:focus-outside-panel', { bubbles: true }));
      }
    } else {
      this.focusedElement = null;
    }
  }

  addEvents() {
    document.addEventListener('click', this.clickHandler);
    this.panelElement.addEventListener('mouseover', this.mouseoverHandler);
    this.panelElement.addEventListener('custom-select:focus-outside-panel', this.focusedHandler);
    this.selectElement.addEventListener('change', this.changeHandler);
    this.containerElement.addEventListener('keydown', this.keydownHandler);
  }

  mouseoverEvent(evt) {
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.classList.contains(this.params.optionClass)) {
      this.setFocusedElement(target);
    }
  }

  keydownEvent(evt) {
    if (!this.isOpen) {
      if (evt.code === 'ArrowUp' || evt.code === 'ArrowDown' || evt.code === 'Space') {
        this.open = true;
      }
    } else {
      switch (evt.code) {
        case 'Enter':
        case 'Space':
          if (!this.focusedElement || !this.selectedElement) return;
          this.setSelectedElement(this.focusedElement);
          this.selectedElement.customSelectOriginalOption.selected = true;
          this.selectElement.dispatchEvent(new CustomEvent('change'));
          this.open = false;
          break;
        case 'Escape':
          this.open = false;
          break;
        case 'ArrowUp':
          this.moveFocusedElement(-1);
          break;
        case 'ArrowDown':
          this.moveFocusedElement(+1);
          break;
      }
    }
  }

  moveFocusedElement(direction) {
    const currentFocusedIndex = Array.from(this.selectElement.options).indexOf(
      this.focusedElement.customSelectOriginalOption
    );

    if (this.selectElement.options[currentFocusedIndex + direction]) {
      this.setFocusedElement(this.selectElement.options[currentFocusedIndex + direction].customSelectCstOption);
    }
  }

  scrollToFocused(evt) {
    const currPanel = evt.currentTarget;
    const currOption = evt.target;
    if (!(currPanel instanceof HTMLElement) || !(currOption instanceof HTMLElement)) return;

    if (currOption.offsetTop < currPanel.scrollTop) {
      currPanel.scrollTop = currOption.offsetTop;
    } else {
      currPanel.scrollTop = currOption.offsetTop + currOption.clientHeight - currPanel.clientHeight;
    }
  }

  changeEvent() {
    const index = this.selectElement.selectedIndex;
    const element = index === -1 ? undefined : this.selectElement.options[index].customSelectCstOption;

    this.setSelectedElement(element);
  }

  clickEvent(evt) {
    const target = evt.target;
    if (!(target instanceof HTMLElement)) return;
    if (target === this.containerElement || this.openerElement.contains(target)) {
      if (this.isOpen) {
        this.open = false;
      } else {
        this.open = true;
      }
    } else if (
      target.classList &&
      target.classList.contains(this.params.optionClass) &&
      this.panelElement.contains(target)
    ) {
      this.setSelectedElement(target);
      this.selectedElement.customSelectOriginalOption.selected = true;
      this.open = false;
      this.selectElement.dispatchEvent(new CustomEvent('change'));
    } else if (target === this.selectElement) {
      if (opener !== document.activeElement && this.selectElement !== document.activeElement) {
        this.openerElement.focus();
      }
    } else if (this.isOpen && !this.containerElement.contains(target)) {
      this.open = false;
    }
  }

  get open() {
    return this.isOpen;
  }

  set open(predicate) {
    if (predicate || typeof predicate === 'undefined') {
      this.containerElement.classList.add(this.params.isOpenClass);
      this.containerElement.classList.add(this.params.isOpenClass);
      this.openerElement.setAttribute('aria-expanded', 'true');

      if (this.selectedElement) {
        this.panelElement.scrollTop = this.selectedElement.offsetTop;
      }

      this.containerElement.dispatchEvent(new CustomEvent('custom-select:open'));
      this.isOpen = true;
    } else {
      this.containerElement.classList.remove(this.params.isOpenClass);
      this.openerElement.setAttribute('aria-expanded', 'false');
      this.isOpen = false;
      if (this.selectedElement) {
        this.setFocusedElement(this.selectedElement);
      }
      this.containerElement.dispatchEvent(new CustomEvent('custom-select:close'));
    }
  }
}
