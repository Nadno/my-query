/**
 * DateTime - Wrapper imutável sobre Date nativo
 * Utiliza Intl.DateTimeFormat para formatação e Date para lógica de calendário
 */
import { TimeSpan } from './time-span';

// ========== CONSTANTES DO CALENDÁRIO ==========

export const DAYS_IN_WEEK = 7;
export const MONTHS_IN_YEAR = 12;

// ========== UTILIDADES ==========

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month}. Use valores de 1 a 12.`);
  }
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function isValidDate(year: number, month: number, day: number): boolean {
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

export function getMonthName(
  month: number,
  locale: string = 'pt-BR',
  options: Intl.DateTimeFormatOptions = { month: 'long' },
): string {
  const date = new Date(Date.UTC(2024, month - 1, 1));
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: 'UTC',
  }).format(date);
}

export function getYearDifference(start: DateTime, end: DateTime): number {
  let years = end.year - start.year;
  const monthDiff = end.month - start.month;
  const dayDiff = end.day - start.day;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--;
  }

  return years;
}

export class DateTime {
  private readonly _date: Date;
  private constructor(date: Date) {
    this._date = date;
  }

  // ========== STATIC FACTORIES ==========

  static now(): DateTime {
    return new DateTime(new Date());
  }

  static today(): DateTime {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return new DateTime(date);
  }

  static tomorrow(): DateTime {
    return DateTime.today().plusDays(1);
  }

  static yesterday(): DateTime {
    return DateTime.today().minusDays(1);
  }

  static fromDate(date: Date): DateTime {
    return new DateTime(new Date(date.getTime()));
  }

  static fromTimestamp(ms: number): DateTime {
    return new DateTime(new Date(ms));
  }

  static fromISO(iso: string): DateTime {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      throw new Error(`ISO inválido: "${iso}"`);
    }
    return new DateTime(date);
  }

  static create(
    year: number,
    month: number,
    day: number = 1,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    ms: number = 0,
  ): DateTime {
    if (!isValidDate(year, month, day)) {
      throw new Error(
        `Data inválida: ${day}/${month}/${year}. ` +
          `${month} tem no máximo ${getDaysInMonth(year, month)} dias.`,
      );
    }
    return new DateTime(
      new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms)),
    );
  }

  static in(time: string, from: DateTime = DateTime.now()): DateTime {
    const span = TimeSpan.parse(time);
    return from.plus(span);
  }

  static ago(time: string, from: DateTime = DateTime.now()): DateTime {
    const span = TimeSpan.parse(time);
    return from.minus(span);
  }

  // ========== STATIC UTILITIES ==========

  static isLeapYear(year: number): boolean {
    return isLeapYear(year);
  }

  static daysInMonth(year: number, month: number): number {
    return getDaysInMonth(year, month);
  }

  static isValid(year: number, month: number, day: number): boolean {
    return isValidDate(year, month, day);
  }

  static monthNames(
    locale: string = 'pt-BR',
    options: Intl.DateTimeFormatOptions = { month: 'long' },
  ): string[] {
    return Array.from({ length: 12 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
        new Date(Date.UTC(2024, i, 1)),
      ),
    );
  }

  static weekdayNames(
    locale: string = 'pt-BR',
    options: Intl.DateTimeFormatOptions = { weekday: 'long' },
  ): string[] {
    // Sunday = 0 (2024-01-07 is a Sunday)
    return Array.from({ length: 7 }, (_, i) =>
      new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
        new Date(Date.UTC(2024, 0, 7 + i)),
      ),
    );
  }

  // ========== STATIC BOUNDARIES (conveniences for "today") ==========

  static startOfDay(): DateTime {
    return DateTime.today().startOfDay();
  }

  static endOfDay(): DateTime {
    return DateTime.today().endOfDay();
  }

  static startOfWeek(): DateTime {
    return DateTime.today().startOfWeek();
  }

  static endOfWeek(): DateTime {
    return DateTime.today().endOfWeek();
  }

  static startOfMonth(): DateTime {
    return DateTime.today().startOfMonth();
  }

  static endOfMonth(): DateTime {
    return DateTime.today().endOfMonth();
  }

  static startOfYear(): DateTime {
    return DateTime.today().startOfYear();
  }

  static endOfYear(): DateTime {
    return DateTime.today().endOfYear();
  }

  // ========== UTC GETTERS ==========

  get year(): number {
    return this._date.getUTCFullYear();
  }

  get month(): number {
    return this._date.getUTCMonth() + 1;
  }

  get day(): number {
    return this._date.getUTCDate();
  }

  get dayOfWeek(): number {
    return this._date.getUTCDay();
  }

  get hour(): number {
    return this._date.getUTCHours();
  }

  get minute(): number {
    return this._date.getUTCMinutes();
  }

  get second(): number {
    return this._date.getUTCSeconds();
  }

  get millisecond(): number {
    return this._date.getUTCMilliseconds();
  }

  get timestamp(): number {
    return this._date.getTime();
  }

  // ========== LOCAL TIMEZONE GETTERS ==========

  get localYear(): number {
    return this._date.getFullYear();
  }

  get localMonth(): number {
    return this._date.getMonth() + 1;
  }

  get localDay(): number {
    return this._date.getDate();
  }

  get localHour(): number {
    return this._date.getHours();
  }

  // ========== ARITHMETIC ==========

  plus(timeSpan: TimeSpan): DateTime {
    return new DateTime(new Date(this._date.getTime() + timeSpan.valueOf()));
  }

  minus(timeSpan: TimeSpan): DateTime {
    return new DateTime(new Date(this._date.getTime() - timeSpan.valueOf()));
  }

  diff(other: DateTime): TimeSpan {
    return TimeSpan.fromMilliseconds(
      Math.abs(this._date.getTime() - other._date.getTime()),
    );
  }

  since(): TimeSpan {
    return DateTime.now().diff(this);
  }

  until(): TimeSpan {
    return this.diff(DateTime.now());
  }

  plusMilliseconds(ms: number): DateTime {
    return new DateTime(new Date(this._date.getTime() + ms));
  }

  plusSeconds(seconds: number): DateTime {
    return new DateTime(new Date(this._date.getTime() + seconds * 1000));
  }

  plusMinutes(minutes: number): DateTime {
    return new DateTime(new Date(this._date.getTime() + minutes * 60 * 1000));
  }

  plusHours(hours: number): DateTime {
    return new DateTime(
      new Date(this._date.getTime() + hours * 60 * 60 * 1000),
    );
  }

  plusDays(days: number): DateTime {
    return new DateTime(
      new Date(this._date.getTime() + days * 24 * 60 * 60 * 1000),
    );
  }

  plusWeeks(weeks: number): DateTime {
    return this.plusDays(weeks * 7);
  }

  plusMonths(months: number): DateTime {
    const targetMonth = this.month - 1 + months;
    const targetYear = this.year + Math.floor(targetMonth / 12);
    const adjustedMonth = (((targetMonth % 12) + 12) % 12) + 1;
    const maxDay = getDaysInMonth(targetYear, adjustedMonth);
    const adjustedDay = Math.min(this.day, maxDay);

    return DateTime.create(
      targetYear,
      adjustedMonth,
      adjustedDay,
      this.hour,
      this.minute,
      this.second,
      this.millisecond,
    );
  }

  plusYears(years: number): DateTime {
    const targetYear = this.year + years;
    const maxDay = getDaysInMonth(targetYear, this.month);
    const adjustedDay = Math.min(this.day, maxDay);

    return DateTime.create(
      targetYear,
      this.month,
      adjustedDay,
      this.hour,
      this.minute,
      this.second,
      this.millisecond,
    );
  }

  minusMilliseconds(ms: number): DateTime {
    return this.plusMilliseconds(-ms);
  }

  minusSeconds(seconds: number): DateTime {
    return this.plusSeconds(-seconds);
  }

  minusMinutes(minutes: number): DateTime {
    return this.plusMinutes(-minutes);
  }

  minusHours(hours: number): DateTime {
    return this.plusHours(-hours);
  }

  minusDays(days: number): DateTime {
    return this.plusDays(-days);
  }

  minusWeeks(weeks: number): DateTime {
    return this.plusWeeks(-weeks);
  }

  minusMonths(months: number): DateTime {
    return this.plusMonths(-months);
  }

  minusYears(years: number): DateTime {
    return this.plusYears(-years);
  }

  yearsDiff(other: DateTime): number {
    return getYearDifference(this, other);
  }

  // ========== BOUNDARY OPERATIONS ==========

  startOfDay(): DateTime {
    const d = new Date(this._date);
    d.setUTCHours(0, 0, 0, 0);
    return new DateTime(d);
  }

  endOfDay(): DateTime {
    const d = new Date(this._date);
    d.setUTCHours(23, 59, 59, 999);
    return new DateTime(d);
  }

  startOfWeek(): DateTime {
    const d = new Date(this._date);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    d.setUTCHours(0, 0, 0, 0);
    return new DateTime(d);
  }

  endOfWeek(): DateTime {
    const start = this.startOfWeek();
    const d = new Date(start._date);
    d.setUTCDate(d.getUTCDate() + 6);
    d.setUTCHours(23, 59, 59, 999);
    return new DateTime(d);
  }

  startOfMonth(): DateTime {
    const d = new Date(this._date);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return new DateTime(d);
  }

  endOfMonth(): DateTime {
    const d = new Date(this._date);
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(0);
    d.setUTCHours(23, 59, 59, 999);
    return new DateTime(d);
  }

  startOfYear(): DateTime {
    const d = new Date(this._date);
    d.setUTCMonth(0);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return new DateTime(d);
  }

  endOfYear(): DateTime {
    const d = new Date(this._date);
    d.setUTCMonth(11);
    d.setUTCDate(31);
    d.setUTCHours(23, 59, 59, 999);
    return new DateTime(d);
  }

  // ========== COMPARISON ==========

  isAfter(other: DateTime): boolean {
    return this._date > other._date;
  }

  isBefore(other: DateTime): boolean {
    return this._date < other._date;
  }

  isSame(other: DateTime): boolean {
    return this._date.getTime() === other._date.getTime();
  }

  isSameDay(other: DateTime): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  isSameMonth(other: DateTime): boolean {
    return this.year === other.year && this.month === other.month;
  }

  isSameYear(other: DateTime): boolean {
    return this.year === other.year;
  }

  isFuture(refNow: number = Date.now()): boolean {
    return this._date.getTime() > refNow;
  }

  isPast(refNow: number = Date.now()): boolean {
    return this._date.getTime() < refNow;
  }

  isToday(): boolean {
    return this.isSameDay(DateTime.today());
  }

  isLeapYear(): boolean {
    return isLeapYear(this.year);
  }

  // ========== FORMATTING (Intl) ==========

  format(
    options?: Intl.DateTimeFormatOptions,
    locale: string = 'pt-BR',
  ): string {
    return new Intl.DateTimeFormat(locale, options).format(this._date);
  }

  toThinkingDate(locale: string = 'pt-BR'): string {
    return this.format(
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
      locale,
    );
  }

  toLocaleDateString(locale: string = 'pt-BR'): string {
    return new Intl.DateTimeFormat(locale).format(this._date);
  }

  toLocaleTimeString(locale: string = 'pt-BR'): string {
    return new Intl.DateTimeFormat(locale, { timeStyle: 'medium' }).format(
      this._date,
    );
  }

  toLocaleString(
    locale: string = 'pt-BR',
    options?: Intl.DateTimeFormatOptions,
  ): string {
    return new Intl.DateTimeFormat(locale, options).format(this._date);
  }

  // ========== INTEROP ==========

  toDate(): Date {
    return new Date(this._date);
  }

  toISOString(): string {
    return this._date.toISOString();
  }

  toUTCDateString(): string {
    return `${this.year.toString().padStart(4, '0')}-${this.month
      .toString()
      .padStart(2, '0')}-${this.day.toString().padStart(2, '0')}`;
  }

  toUTCTimeString(
    format: 'HH' | 'HH:mm' | 'HH:mm:ss' | 'HH:mm:ss.SSS' = 'HH:mm:ss',
  ): string {
    const h = this.hour.toString().padStart(2, '0');
    const m = this.minute.toString().padStart(2, '0');
    const s = this.second.toString().padStart(2, '0');
    const ms = this.millisecond.toString().padStart(3, '0');

    switch (format) {
      case 'HH':
        return h;
      case 'HH:mm':
        return `${h}:${m}`;
      case 'HH:mm:ss':
        return `${h}:${m}:${s}`;
      case 'HH:mm:ss.SSS':
        return `${h}:${m}:${s}.${ms}`;
    }
  }

  toZonedISODateString(): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${this._date.getFullYear()}-${pad(this._date.getMonth() + 1)}-${pad(
      this._date.getDate(),
    )}`;
  }

  toZonedISOTimeString(): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(this._date.getHours())}:${pad(this._date.getMinutes())}`;
  }

  toZonedISODateTimeString(): string {
    return `${this.toZonedISODateString()}T${this.toZonedISOTimeString()}`;
  }

  toDateString(): string {
    return this._date.toDateString();
  }

  toTimeString(): string {
    return this._date.toTimeString();
  }

  toUTCString(): string {
    return this._date.toUTCString();
  }

  toJSON(): string {
    return this.toISOString();
  }

  valueOf(): number {
    return this._date.getTime();
  }

  toString(): string {
    return this.toISOString();
  }

  clone(): DateTime {
    return new DateTime(new Date(this._date));
  }
}

// ========== RE-EXPORTS PARA COMPATIBILIDADE ==========

export { TimeSpan };
