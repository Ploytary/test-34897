import { findHtmlElement } from '../helpers.js';

export class OverlayControl {
  modals = new Set();
  controlHandler = this.controlItem.bind(this);
  scrollController;

  constructor(scrollController) {
    this.scrollController = scrollController;
    this.addEvents();
  }

  registerModal(modal) {
    this.modals.add(modal);
    this.init();
  }

  init() {
    this.modals.forEach((modal) => modal.subscribe(this.controlHandler));
  }

  controlItem(modal) {
    if (modal.isOpen) {
      this.modals.forEach((item) => {
        modal != item && item.close();
        item.view.classList.toggle('page-overlay__modal--visible', item === modal);
      });
      this.scrollController.updatePluginOptions('modal', { open: true });
    } else {
      modal.view.classList.remove('page-overlay__modal--visible');
      this.scrollController.updatePluginOptions('modal', { open: false });
    }
  }

  addEvents() {
    document.body.addEventListener('keydown', (evt) => {
      evt.code === 'Escape' && this.modals.forEach((item) => item.close());
    });
  }
}

export class Modal {
  openTrigger;
  closeButton;
  view;
  isOpen = false;
  controllerCallback;

  constructor(openTrigger, view, closeButton) {
    this.openTrigger = findHtmlElement(openTrigger);
    this.view = findHtmlElement(view);
    this.closeButton = findHtmlElement(closeButton);
    this.addEvents();
  }

  addEvents() {
    this.openTrigger.addEventListener('click', () => {
      this.isOpen ? this.close() : this.open();
    });

    this.closeButton.addEventListener('click', () => {
      this.close();
    });

    this.view.addEventListener('submit', () => {
      this.close();
    });
  }

  open() {
    this.isOpen = true;
    this.controllerCallback && this.controllerCallback(this);
  }

  close() {
    this.isOpen = false;
    this.controllerCallback && this.controllerCallback(this);
  }

  subscribe(callback) {
    this.controllerCallback = callback;
  }
}
