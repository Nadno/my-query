import fs from 'fs';
import path from 'path';

export const setDOMEnvironment = (fileName: string) => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'environment', `${fileName}.html`),
    'utf-8',
  );

  document.body.innerHTML = '';
  document.documentElement.innerHTML = file.replace(
    /.*<html[^>]*>|<\/html>.*/gs,
    '',
  );
};
