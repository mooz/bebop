const { JSDOM } = require('jsdom');
const logger    = require('kiroku');
const browser   = require('./browser_mock');

const body = '<div id="container" />';
const jsdom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
  pretendToBeVisual: true,
  url:               'https://example.org/',
});
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce((result, prop) => Object.assign({}, result, {
      [prop]: Object.getOwnPropertyDescriptor(src, prop),
    }), {});
  Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
  userAgent: 'node.js',
};

Object.defineProperties(window.HTMLElement.prototype, {
  offsetLeft: {
    get() { return parseFloat(window.getComputedStyle(this).marginLeft) || 0; },
  },
  offsetTop: {
    get() { return parseFloat(window.getComputedStyle(this).marginTop) || 0; },
  },
  offsetHeight: {
    get() { return parseFloat(window.getComputedStyle(this).height) || 0; },
  },
  offsetWidth: {
    get() { return parseFloat(window.getComputedStyle(this).width) || 0; },
  },
});

window.HTMLElement.prototype.scrollIntoView = () => {};

global.browser = browser;
global.chrome = null;

copyProps(window, global);

const enzyme  = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

enzyme.configure({ adapter: new Adapter() });
logger.setLevel('FATAL');
