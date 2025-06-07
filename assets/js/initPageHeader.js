import { findHtmlElement } from './helpers.js';
import { CustomSelect } from './libs/CustomSelect.js';

export function initPageHeader() {
  initHeaderSelect();
  pushPageContent();
}

function initHeaderSelect() {
  const select = findHtmlElement('.custom-select');
  const svg = `<svg class="svg-icon arrow-icon">
          <use xlink:href="assets/img/symbol-sprite.svg#arrow"></use>
        </svg>`;

  new CustomSelect(select, { svgIconMarkup: svg });
}

function pushPageContent() {
  const header = findHtmlElement('.page-header');
  const firstPageSection = findHtmlElement('main .section');

  firstPageSection.style.paddingTop = `${header.clientHeight}px`;
  let prevHeaderSize = header.clientHeight;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const currentHeaderSize = entry.borderBoxSize[0].blockSize;
      if (currentHeaderSize != prevHeaderSize) {
        firstPageSection.style.paddingTop = `${header.clientHeight}px`;
        prevHeaderSize = currentHeaderSize;
      }
    }
  });

  observer.observe(header);
}
