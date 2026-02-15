/**
 * TimeSpan - Representa duração física em milissegundos
 * Centraliza TODA a lógica de parsing de strings de duração
 */

// ========== TIPOS ==========

export type TimeInput = string | number;

// ========== CONSTANTES FÍSICAS ==========

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;

export class TimeSpan {
  private readonly _ms: number;
  private constructor(ms: number) { this._ms = ms; }

  // ========== STATIC FACTORIES ==========

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

  // ========== CALENDÁRIO EXATO ==========

  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  private static getDaysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
  }

  private static calculateDaysInYears(startYear: number, endYear: number): number {
    let totalDays = 0;
    for (let year = startYear; year < endYear; year++) {
      totalDays += TimeSpan.isLeapYear(year) ? 366 : 365;
    }
    return totalDays;
  }

  static fromMonthsExact(months: number, startYear: number = 2024): TimeSpan {
    if (months < 0) {
      throw new Error(`Meses negativos não são suportados.`);
    }
    let totalDays = 0;
    let currentYear = startYear;
    let currentMonth = 1;

    for (let i = 0; i < months; i++) {
      totalDays += TimeSpan.getDaysInMonth(currentYear, currentMonth);
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    return new TimeSpan(totalDays * MS_PER_DAY);
  }

  static fromYearsExact(years: number, startYear: number = 2024): TimeSpan {
    if (years < 0) {
      throw new Error(`Anos negativos não são suportados. Use fromYears(${years}) ou TimeSpan.parse('${years}y') para durações negativas.`);
    }
    const totalDays = TimeSpan.calculateDaysInYears(startYear, startYear + years);
    return new TimeSpan(totalDays * MS_PER_DAY);
  }

  static fromMonthDays(days: number, year: number, month: number): TimeSpan {
    const maxDays = TimeSpan.getDaysInMonth(year, month);
    if (days > maxDays) {
      throw new Error(
        `Mês ${month}/${year} tem no máximo ${maxDays} dias. ` +
        `Tentativa de criar TimeSpan com ${days} dias é inválida.`
      );
    }
    return new TimeSpan(days * MS_PER_DAY);
  }

  static fromYearDays(days: number, year: number): TimeSpan {
    const maxDays = TimeSpan.isLeapYear(year) ? 366 : 365;
    if (days < 1 || days > maxDays) {
      throw new Error(
        `Ano ${year} tem ${maxDays} dias. ` +
        `Tentativa de criar TimeSpan com ${days} dias é inválida.`
      );
    }
    return new TimeSpan(days * MS_PER_DAY);
  }

  // ========== PARSING CENTRALIZADO ==========

  private static readonly PARSE_REGEX =
    /^([-+]?\d+y)?\s*([-+]?\d+w)?\s*([-+]?\d+d)?\s*([-+]?\d+h)?\s*([-+]?\d+m)?\s*([-+]?\d+s)?(?:\s*([-+]?\d+ms))?$/i;

  static parse(input: string): TimeSpan {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error(`Invalid TimeSpan format: "${input}"`);
    }
    const match = trimmed.match(TimeSpan.PARSE_REGEX);
    if (!match) {
      throw new Error(`Invalid TimeSpan format: "${input}"`);
    }

    const [, y, w, d, h, m, s, ms] = match;
    let total = 0;

    if (y) total += parseInt(y) * 365 * MS_PER_DAY;
    if (w) total += parseInt(w) * MS_PER_WEEK;
    if (d) total += parseInt(d) * MS_PER_DAY;
    if (h) total += parseInt(h) * MS_PER_HOUR;
    if (m) total += parseInt(m) * MS_PER_MINUTE;
    if (s) total += parseInt(s) * MS_PER_SECOND;
    if (ms) total += parseInt(ms);

    return new TimeSpan(total);
  }

  static fromISO(duration: string): TimeSpan {
    const match = duration.trim().match(
      /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/
    );
    if (!match) {
      throw new Error(`Invalid ISO 8601 Duration: "${duration}"`);
    }

    const [, years, months, days, hours, minutes, seconds] = match;
    let total = 0;

    if (years) total += parseInt(years) * 365 * MS_PER_DAY;
    if (months) total += parseInt(months) * 30 * MS_PER_DAY;
    if (days) total += parseInt(days) * MS_PER_DAY;
    if (hours) total += parseInt(hours) * MS_PER_HOUR;
    if (minutes) total += parseInt(minutes) * MS_PER_MINUTE;
    if (seconds) total += parseFloat(seconds) * MS_PER_SECOND;

    return new TimeSpan(total);
  }

  static from(input: string | number): TimeSpan {
    if (typeof input === 'number') return new TimeSpan(input);
    return TimeSpan.parse(input);
  }

  static isValid(input: string): boolean {
    try {
      TimeSpan.parse(input);
      return true;
    } catch {
      return false;
    }
  }

  static fromDate(date: Date): TimeSpan {
    return new TimeSpan(date.getTime());
  }

  static fromTimestamp(ms: number): TimeSpan {
    return new TimeSpan(ms);
  }

  // ========== GETTERS ==========

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

  get days(): number {
    return this.totalDays;
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

  // ========== ARITHMETIC ==========

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
    return new TimeSpan(this._ms / divisor);
  }

  // ========== COMPARISON ==========

  isLongerThan(other: TimeSpan): boolean {
    return this._ms > other._ms;
  }

  isShorterThan(other: TimeSpan): boolean {
    return this._ms < other._ms;
  }

  equals(other: TimeSpan): boolean {
    return this._ms === other._ms;
  }

  // ========== INTEROP ==========

  valueOf(): number {
    return this._ms;
  }

  toJSON(): number {
    return this._ms;
  }

  clone(): TimeSpan {
    return new TimeSpan(this._ms);
  }

  toString(): string {
    if (this._ms === 0) return '0ms';
    const parts: string[] = [];
    let remaining = Math.abs(this._ms);

    const days = Math.floor(remaining / MS_PER_DAY);
    if (days) { parts.push(`${days}d`); remaining %= MS_PER_DAY; }

    const hours = Math.floor(remaining / MS_PER_HOUR);
    if (hours) { parts.push(`${hours}h`); remaining %= MS_PER_HOUR; }

    const minutes = Math.floor(remaining / MS_PER_MINUTE);
    if (minutes) { parts.push(`${minutes}m`); remaining %= MS_PER_MINUTE; }

    const seconds = Math.floor(remaining / MS_PER_SECOND);
    if (seconds) { parts.push(`${seconds}s`); }

    return this._ms < 0 ? `-${parts.join(' ')}` : parts.join(' ');
  }
}
