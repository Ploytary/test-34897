import { findHtmlElement } from './helpers.js';

export function initVideoWidget() {
  const videoWidget = findHtmlElement('.video-widget');
  const videoWidgetButton = findHtmlElement('.video-widget__playback-button', videoWidget);
  const videoElement = findHtmlElement('video', videoWidget);

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      videoElement.style.visibility = 'hidden';
    }
  });

  videoWidgetButton.addEventListener('click', () => {
    videoElement.style.visibility = 'visible';
    videoElement.requestFullscreen();
    videoElement.play();
  });
}
