let postMessage = () => {};
let argListener = () => {};

export function getArgListener() {
  return argListener;
}

export function setPostMessageFunction(f) {
  postMessage = f;
}

export const Type = {
  boolean: 'boolean',
  string:  'string',
  integer: 'integer',
  number:  'number',
  array:   'array',
  object:  'object',
};

export function requestArg(scheme) {
  return new Promise((resolve, reject) => {
    try {
      argListener = resolve;
      postMessage('REQUEST_ARG', { scheme });
    } catch (e) {
      reject(e);
    }
  });
}
