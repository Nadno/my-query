import { describe, expect, it } from 'vitest';

import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, TimeSpan } from './TimeSpan';

describe('TimeSpan', () => {
  it('parse turns 5m into 300000 ms', () => {
    expect(TimeSpan.parse('5m').totalMilliseconds).toBe(5 * MS_PER_MINUTE);
  });

  it('parse accepts compound strings', () => {
    expect(TimeSpan.parse('2h 30m').totalMilliseconds).toBe(
      2 * MS_PER_HOUR + 30 * MS_PER_MINUTE,
    );
  });

  it('parse rejects empty and invalid strings', () => {
    expect(() => TimeSpan.parse('')).toThrow(/Invalid TimeSpan format/);
    expect(() => TimeSpan.parse('nope')).toThrow(/Invalid TimeSpan format/);
    expect(TimeSpan.isValid('5m')).toBe(true);
    expect(TimeSpan.isValid('nope')).toBe(false);
  });

  it('tryParse returns Result instead of throwing', () => {
    const [span, okError] = TimeSpan.tryParse('5m');
    expect(okError).toBeNull();
    expect(span?.totalMilliseconds).toBe(5 * MS_PER_MINUTE);

    const [missing, failError] = TimeSpan.tryParse('nope');
    expect(missing).toBeNull();
    expect(failError).toBeInstanceOf(Error);
    expect((failError as Error).message).toMatch(/Invalid TimeSpan format/);
  });

  it('from accepts milliseconds or a parseable string', () => {
    expect(TimeSpan.from(1500).totalMilliseconds).toBe(1500);
    expect(TimeSpan.from('1s').equals(TimeSpan.fromSeconds(1))).toBe(true);
  });

  it('plus and equals compose durations', () => {
    const sum = TimeSpan.parse('1m').plus(TimeSpan.parse('30s'));
    expect(sum.equals(TimeSpan.parse('90s'))).toBe(true);
    expect(sum.equals(TimeSpan.parse('1m'))).toBe(false);
  });

  it('days is the remainder of a week; totalDays is the total', () => {
    const eight = TimeSpan.fromDays(8);
    expect(eight.totalDays).toBe(8);
    expect(eight.weeks).toBe(1);
    expect(eight.days).toBe(1);
    expect(eight.toString()).toBe('1w 1d');

    const parsed = TimeSpan.parse('1w 2d');
    expect(parsed.weeks).toBe(1);
    expect(parsed.days).toBe(2);
    expect(parsed.totalDays).toBe(9);
    expect(parsed.totalMilliseconds).toBe(9 * MS_PER_DAY);
  });

  it('toString includes milliseconds when present', () => {
    expect(TimeSpan.fromMilliseconds(1500).toString()).toBe('1s 500ms');
    expect(TimeSpan.fromMilliseconds(90_001).toString()).toBe('1m 30s 1ms');
    expect(TimeSpan.fromMilliseconds(500).toString()).toBe('500ms');
  });

  it('dividedBy throws RangeError when the divisor is zero', () => {
    expect(() => TimeSpan.parse('1m').dividedBy(0)).toThrow(RangeError);
  });
});
