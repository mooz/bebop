const characterMap = [];
characterMap[192] = '~';
characterMap[49]  = '!';
characterMap[50]  = '@';
characterMap[51]  = '#';
characterMap[52]  = '$';
characterMap[53]  = '%';
characterMap[54]  = '^';
characterMap[55]  = '&';
characterMap[56]  = '*';
characterMap[57]  = '(';
characterMap[48]  = ')';
characterMap[109] = '_';
characterMap[107] = '+';
characterMap[219] = '{';
characterMap[221] = '}';
characterMap[220] = '|';
characterMap[59]  = ':';
characterMap[222] = '\'';
characterMap[188] = '<';
characterMap[190] = '>';
characterMap[191] = '?';
characterMap[32]  = 'SPC';
characterMap[38]  = 'up';
characterMap[40]  = 'down';
characterMap[9]   = 'tab';
characterMap[13]  = 'return';
characterMap[27]  = 'ESC';

export default function keySequence(keyEvent) {
  let code = String.fromCharCode(keyEvent.keyCode).toLowerCase();
  if (characterMap[keyEvent.keyCode]) {
    code = characterMap[keyEvent.keyCode];
  }
  let prefix = '';
  if (keyEvent.ctrlKey) {
    prefix += 'C-';
  }
  if (keyEvent.metaKey) {
    prefix += 'M-';
  }
  if (keyEvent.shiftKey) {
    prefix += 'S-';
  }
  return `${prefix}${code}`;
}
