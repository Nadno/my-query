import { Result, type AnyResult } from '../result';

export type TimeInput = string | number;

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;

function invalidFormat(input: string): Error {
  return new Error(`Invalid TimeSpan format: "${input}"`);
}

export class TimeSpan {
  private readonly _ms: number;

  private constructor(ms: number) {
    this._ms = ms;
  }

  static fromMilliseconds(ms: number): TimeSpan {
    return new TimeSpan(ms);
  }

  static fromSeconds(seconds: number): TimeSpan {
    return new TimeSpan(seconds * MS_PER_SECOND);
  }

  static fromMinutes(minutes: number): TimeSpan {
    return new TimeSpan(minutes * MS_PER_MINUTE);
  }

  static fromHours(hours: number): TimeSpan {
    return new TimeSpan(hours * MS_PER_HOUR);
  }

  static fromDays(days: number): TimeSpan {
    return new TimeSpan(days * MS_PER_DAY);
  }

  static fromWeeks(weeks: number): TimeSpan {
    return new TimeSpan(weeks * MS_PER_WEEK);
  }

  static zero(): TimeSpan {
    return new TimeSpan(0);
  }

  private static readonly PARSE_REGEX =
    /^([-+]?\d+y)?\s*([-+]?\d+w)?\s*([-+]?\d+d)?\s*([-+]?\d+h)?\s*([-+]?\d+m)?\s*([-+]?\d+s)?(?:\s*([-+]?\d+ms))?$/i;

  static tryParse(input: string): AnyResult<TimeSpan> {
    const trimmed = input.trim();
    if (!trimmed) {
      return Result.fail(invalidFormat(input));
    }
    const match = trimmed.match(TimeSpan.PARSE_REGEX);
    if (!match) {
      return Result.fail(invalidFormat(input));
    }

    const [, y, w, d, h, m, s, ms] = match;
    let total = 0;

    if (y) total += parseInt(y, 10) * 365 * MS_PER_DAY;
    if (w) total += parseInt(w, 10) * MS_PER_WEEK;
    if (d) total += parseInt(d, 10) * MS_PER_DAY;
    if (h) total += parseInt(h, 10) * MS_PER_HOUR;
    if (m) total += parseInt(m, 10) * MS_PER_MINUTE;
    if (s) total += parseInt(s, 10) * MS_PER_SECOND;
    if (ms) total += parseInt(ms, 10);

    return Result.ok(new TimeSpan(total));
  }

  static parse(input: string): TimeSpan {
    return Result.unwrap(TimeSpan.tryParse(input));
  }

  static from(input: TimeInput): TimeSpan {
    if (typeof input === 'number') return new TimeSpan(input);
    return TimeSpan.parse(input);
  }

  static isValid(input: string): boolean {
    const [, error] = TimeSpan.tryParse(input);
    return error === null;
  }

  get totalMilliseconds(): number {
    return this._ms;
  }

  get totalSeconds(): number {
    return Math.floor(this._ms / MS_PER_SECOND);
  }

  get totalMinutes(): number {
    return Math.floor(this._ms / MS_PER_MINUTE);
  }

  get totalHours(): number {
    return Math.floor(this._ms / MS_PER_HOUR);
  }

  get totalDays(): number {
    return Math.floor(this._ms / MS_PER_DAY);
  }

  get weeks(): number {
    const sign = this._ms < 0 ? -1 : 1;
    return sign * Math.floor(Math.abs(this._ms) / MS_PER_WEEK);
  }

  get days(): number {
    const sign = this._ms < 0 ? -1 : 1;
    return sign * Math.floor((Math.abs(this._ms) % MS_PER_WEEK) / MS_PER_DAY);
  }

  get hours(): number {
    return Math.floor((this._ms % MS_PER_DAY) / MS_PER_HOUR);
  }

  get minutes(): number {
    return Math.floor((this._ms % MS_PER_HOUR) / MS_PER_MINUTE);
  }

  get seconds(): number {
    return Math.floor((this._ms % MS_PER_MINUTE) / MS_PER_SECOND);
  }

  get isZero(): boolean {
    return this._ms === 0;
  }

  get isNegative(): boolean {
    return this._ms < 0;
  }

  plus(other: TimeSpan): TimeSpan {
    return new TimeSpan(this._ms + other._ms);
  }

  minus(other: TimeSpan): TimeSpan {
    return new TimeSpan(this._ms - other._ms);
  }

  times(factor: number): TimeSpan {
    return new TimeSpan(this._ms * factor);
  }

  dividedBy(divisor: number): TimeSpan {
    if (divisor === 0) {
      throw new RangeError('Division by zero');
    }
    return new TimeSpan(this._ms / divisor);
  }

  isLongerThan(other: TimeSpan): boolean {
    return this._ms > other._ms;
  }

  isShorterThan(other: TimeSpan): boolean {
    return this._ms < other._ms;
  }

  equals(other: TimeSpan): boolean {
    return this._ms === other._ms;
  }

  valueOf(): number {
    return this._ms;
  }

  toJSON(): number {
    return this._ms;
  }

  toString(): string {
    if (this._ms === 0) return '0ms';
    const parts: string[] = [];
    let remaining = Math.abs(this._ms);

    const weeks = Math.floor(remaining / MS_PER_WEEK);
    if (weeks) {
      parts.push(`${weeks}w`);
      remaining %= MS_PER_WEEK;
    }

    const days = Math.floor(remaining / MS_PER_DAY);
    if (days) {
      parts.push(`${days}d`);
      remaining %= MS_PER_DAY;
    }

    const hours = Math.floor(remaining / MS_PER_HOUR);
    if (hours) {
      parts.push(`${hours}h`);
      remaining %= MS_PER_HOUR;
    }

    const minutes = Math.floor(remaining / MS_PER_MINUTE);
    if (minutes) {
      parts.push(`${minutes}m`);
      remaining %= MS_PER_MINUTE;
    }

    const seconds = Math.floor(remaining / MS_PER_SECOND);
    if (seconds) {
      parts.push(`${seconds}s`);
      remaining %= MS_PER_SECOND;
    }

    if (remaining) {
      parts.push(`${remaining}ms`);
    }

    return this._ms < 0 ? `-${parts.join(' ')}` : parts.join(' ');
  }
}
