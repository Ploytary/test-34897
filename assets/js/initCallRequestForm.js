import { findHtmlElement } from './helpers.js';

export function initCallRequestForm() {
  const form = findHtmlElement('.request-call-form-section__form');
  const element = findHtmlElement('[type="tel"]', form);

  const maskOptions = {
    mask: '+{7} (000) 000-00-00',
  };
  const mask = IMask(element, maskOptions);

  element.addEventListener('focus', () => {
    mask.updateOptions({ ...maskOptions, lazy: false });
  });

  element.addEventListener('blur', () => {
    mask.updateOptions({ ...maskOptions, lazy: true });
  });

  form.addEventListener('submit', (evt) => {
    evt.preventDefault();
    const form = evt.target;
    const formdata = new FormData(form);
    for (const [name, value] of formdata) {
      console.log(`${name}: ${value}`);
    }
    form.reset();
    mask.value = '';
  });
}
