import { initPageHeader } from './initPageHeader.js';
import { initSmoothScroll } from './initSmoothScroll.js';
import { initOverlay } from './initOverlay.js';
import { initCallRequestForm } from './initCallRequestForm.js';
import { initVideoWidget } from './initVideoWidget.js';

const scroll = initSmoothScroll();
initOverlay(scroll);
initPageHeader();
initCallRequestForm();
initVideoWidget();
