import { MyQueryBase } from '../types';

export default class MyQuery implements MyQueryBase {
  constructor(public element: Element) {}
}

