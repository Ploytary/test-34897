import { ScrollbarPlugin } from './libs/smooth-scrollbar-plugin.js';
import { findHtmlElement, findHtmlElements } from './helpers.js';

class ModalPlugin extends ScrollbarPlugin {
  static pluginName = 'modal';

  static defaultOptions = {
    open: false,
  };

  transformDelta(delta) {
    return this.options.open ? { x: 0, y: 0 } : delta;
  }
}
Scrollbar.use(ModalPlugin);

export function initSmoothScroll() {
  const scroll = Scrollbar.init(findHtmlElement('body'), { damping: 0.05 });
  scroll.containerEl.style.height = '100dvh';

  const fixedElements = findHtmlElements('.fixed');
  fixedElements.forEach((element) => {
    scroll.addListener(function (status) {
      const offset = status.offset;
      element.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0px)`;
    });
  });

  return scroll;
}
