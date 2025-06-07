export function findHtmlElement(selector, place = document.documentElement) {
  const element = findElement(selector, place);
  if (element instanceof HTMLElement) {
    return element;
  }
  throw new Error(
    'the element found with selector "'
      .concat(selector, '" with type ')
      .concat(element.constructor.name, ' is not an instance of HTMLelement')
  );
}

export function findHtmlElements(selector, place = document.documentElement) {
  const elements = findElements(selector, place);
  if (isHtmlElements(elements)) return elements;
  throw new Error('the elements found with selector "'.concat(selector, '" is not an instance of HTMLelement'));
}

function findElement(selector, place = document.documentElement) {
  const element = place.querySelector(selector);
  if (!element) throw Error('element '.concat(selector, ' does not exist'));
  return element;
}

function findElements(selector, place = document.documentElement) {
  const elements = Array.from(place.querySelectorAll(selector));
  if (!elements.length) throw Error('elements '.concat(selector, ' does not exist'));
  return elements;
}

function isHtmlElement(element) {
  return element instanceof HTMLElement;
}

function isHtmlElements(elements) {
  return elements.every(function (element) {
    return isHtmlElement(element);
  });
}
