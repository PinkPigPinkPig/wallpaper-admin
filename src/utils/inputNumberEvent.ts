const allowedKeys = [
  'Backspace',
  'Tab',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'Delete',
  'Home',
  'End',
  'Escape',
  'Copy',
  'Paste',
];

const checkKeyPressedIsAllowed = (event: React.KeyboardEvent<HTMLInputElement>): boolean => {
  if (
    allowedKeys.includes(event.key) ||
    ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) ||
    (event.key >= '0' && event.key <= '9')
  ) {
    return true;
  }

  return false;
};

const checkOnlyOneDotIsPressed = (event: React.KeyboardEvent<HTMLInputElement>): boolean => {
  const input = event.target as HTMLInputElement;
  if (event.key === '.' && !input.value.includes('.')) {
    return true;
  }

  return false;
};

export const eventInputNumberOnly = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (checkKeyPressedIsAllowed(event)) return;

  event.preventDefault();
};

export const eventInputNumberWithDot = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (checkKeyPressedIsAllowed(event) || checkOnlyOneDotIsPressed(event)) return;

  event.preventDefault();
};

export const removeCommas = (value: string) => {
  if (typeof value !== 'string') return value;
  return value.replace(/,/g, '');
};
