import browser from 'webextension-polyfill';
import logger from 'kiroku';
import search, { init as candidateInit } from './candidates';
import { init as commandInit, find as findCommand } from './commands';
import {
  toggle as togglePopupWindow,
  onWindowRemoved,
  onWindowFocusChanged,
  onTabActived,
} from './popup_window';
import { getActiveContentTab } from './utils/tabs';

let contentScriptPorts = {};
let popupPorts         = {};

if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
logger.info(`bebop starts initialization. log level ${logger.getLevel()}`);

export function getContentScriptPorts() {
  return Object.values(contentScriptPorts);
}

export function getPopupPorts() {
  return Object.values(popupPorts);
}

function postMessageToContentScript(type, payload) {
  const currentWindow = true;
  const active        = true;
  return browser.tabs.query({ currentWindow, active }).then((tabs) => {
    if (tabs.length > 0) {
      const targetUrl = tabs[0].url;
      getContentScriptPorts().forEach(p => p.postMessage({
        type,
        payload,
        targetUrl,
      }));
    }
  });
}

export function executeCommand(commandId, candidates) {
  const command = findCommand(commandId);
  if (command && command.handler) {
    const f = command.handler;
    return f.call(this, candidates);
  }
  return Promise.resolve();
}

function toggleContentPopup() {
  const msg = { type: 'TOGGLE_POPUP' };
  return getActiveContentTab().then(t => browser.tabs.sendMessage(t.id, msg));
}

function handleContentScriptMessage() {}

function connectListener(port) {
  const { name } = port;
  logger.info(`connect channel: ${name}`);
  if (name.startsWith('content-script')) {
    contentScriptPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete contentScriptPorts[name];
      port.onMessage.removeListener(handleContentScriptMessage);
    });
    port.onMessage.addListener(handleContentScriptMessage);
  } else if (name.startsWith('popup')) {
    popupPorts[name] = port;
    port.onDisconnect.addListener(() => {
      delete popupPorts[name];
      postMessageToContentScript('POPUP_CLOSE');
    });
  }
  logger.info(`There are ${Object.values(contentScriptPorts).length} channel`);
}

function activatedListener(payload) {
  getPopupPorts().forEach(p => p.postMessage({
    type: 'TAB_CHANGED',
    payload,
  }));
  setTimeout(() => onTabActived(payload), 10);
}

export function messageListener(request) {
  switch (request.type) {
    case 'SEND_MESSAGE_TO_ACTIVE_CONTENT_TAB': {
      return getActiveContentTab()
        .then(tab => browser.tabs.sendMessage(tab.id, request.payload));
    }
    case 'SEARCH_CANDIDATES': {
      const query = request.payload;
      return search(query);
    }
    case 'EXECUTE_COMMAND': {
      const { commandId, candidates } = request.payload;
      return executeCommand(commandId, candidates);
    }
    default:
      return null;
  }
}

export function commandListener(command) {
  switch (command) {
    case 'toggle_popup_window':
      togglePopupWindow();
      break;
    case 'toggle_content_popup':
      toggleContentPopup();
      break;
    default:
      break;
  }
}

export async function init() {
  contentScriptPorts = {};
  popupPorts         = {};

  const state = await browser.storage.local.get();
  candidateInit(state);
  commandInit();

  browser.windows.onRemoved.addListener(onWindowRemoved);
  browser.windows.onFocusChanged.addListener(onWindowFocusChanged);
  browser.runtime.onConnect.addListener(connectListener);
  browser.tabs.onActivated.addListener(activatedListener);
  browser.runtime.onMessage.addListener(messageListener);
  browser.commands.onCommand.addListener(commandListener);

  logger.info('bebop is initialized.');
}

init();
