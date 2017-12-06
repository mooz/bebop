import browser from 'webextension-polyfill';

export default function candidates(q) {
  return browser.tabs.query({})
    .then(l => l.filter(t => t.title.includes(q) || t.url.includes(q)).map(t => ({
      id:         `${t.id}`,
      label:      `${t.title}: ${t.url}`,
      type:       'tab',
      name:       'activate-tab',
      args:       [t.id, t.windowId],
      faviconUrl: t.favIconUrl,
    })));
}