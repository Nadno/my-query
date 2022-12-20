import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

export const setDOMEnvironment = (fileName: string) => {
  const file = fs.readFileSync(
    path.resolve(__dirname, '..', '..', 'environment', `${fileName}.html`),
    'utf-8',
  );

  const { window } = new JSDOM(file);

  global.window = window as any;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
};
