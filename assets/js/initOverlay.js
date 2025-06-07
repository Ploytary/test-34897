import { Modal, OverlayControl } from './libs/OverlayControl.js';

export function initOverlay(scroll) {
  const overlayControl = new OverlayControl(scroll);

  const callRequestModal = new Modal(
    '.call-request-button',
    '.request-call-form-section',
    '.request-call-form-section__close-button'
  );

  overlayControl.registerModal(callRequestModal);
}
