import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  TimeSpan,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
} from '@/mini-stack/primitives/time-span';

// ========== CONSTANTS ==========

describe('Constants', () => {
  it('should have correct ms values', () => {
    assert.equal(MS_PER_SECOND, 1000);
    assert.equal(MS_PER_MINUTE, 60_000);
    assert.equal(MS_PER_HOUR, 3_600_000);
    assert.equal(MS_PER_DAY, 86_400_000);
    assert.equal(MS_PER_WEEK, 604_800_000);
  });
});

// ========== STATIC FACTORIES ==========

describe('TimeSpan.from', () => {
  it('should parse string input', () => {
    const span = TimeSpan.from('2d 5h');
    assert.equal(span.totalMilliseconds, 2 * MS_PER_DAY + 5 * MS_PER_HOUR);
  });

  it('should treat number as milliseconds', () => {
    const span = TimeSpan.from(5000);
    assert.equal(span.totalMilliseconds, 5000);
  });

  it('should handle zero number', () => {
    assert.equal(TimeSpan.from(0).totalMilliseconds, 0);
  });

  it('should handle negative number', () => {
    assert.equal(TimeSpan.from(-1000).totalMilliseconds, -1000);
  });
});

describe('TimeSpan named factories', () => {
  it('fromMilliseconds', () => {
    assert.equal(TimeSpan.fromMilliseconds(1234).totalMilliseconds, 1234);
  });

  it('fromSeconds', () => {
    assert.equal(TimeSpan.fromSeconds(5).totalMilliseconds, 5000);
  });

  it('fromMinutes', () => {
    assert.equal(TimeSpan.fromMinutes(2).totalMilliseconds, 120_000);
  });

  it('fromHours', () => {
    assert.equal(TimeSpan.fromHours(1).totalMilliseconds, 3_600_000);
  });

  it('fromDays', () => {
    assert.equal(TimeSpan.fromDays(1).totalMilliseconds, 86_400_000);
  });

  it('fromWeeks', () => {
    assert.equal(TimeSpan.fromWeeks(1).totalMilliseconds, 604_800_000);
  });

  it('zero', () => {
    const z = TimeSpan.zero();
    assert.equal(z.totalMilliseconds, 0);
    assert.equal(z.isZero, true);
  });
});

// ========== EXACT CALENDAR FACTORIES ==========

describe('TimeSpan exact calendar', () => {
  it('fromMonthsExact: 1 month from Jan 2024', () => {
    const span = TimeSpan.fromMonthsExact(1, 2024);
    assert.equal(span.totalDays, 31); // January has 31 days
  });

  it('fromMonthsExact: 2 months from Jan 2024', () => {
    const span = TimeSpan.fromMonthsExact(2, 2024);
    assert.equal(span.totalDays, 31 + 29); // Jan + Feb (leap year)
  });

  it('fromMonthsExact: 12 months = full year', () => {
    const span = TimeSpan.fromMonthsExact(12, 2024);
    assert.equal(span.totalDays, 366); // 2024 is leap year
  });

  it('fromMonthsExact: rejects negative', () => {
    assert.throws(() => TimeSpan.fromMonthsExact(-1));
  });

  it('fromYearsExact: leap year', () => {
    assert.equal(TimeSpan.fromYearsExact(1, 2024).totalDays, 366);
  });

  it('fromYearsExact: non-leap year', () => {
    assert.equal(TimeSpan.fromYearsExact(1, 2023).totalDays, 365);
  });

  it('fromYearsExact: rejects negative', () => {
    assert.throws(() => TimeSpan.fromYearsExact(-1));
  });

  it('fromMonthDays: valid', () => {
    const span = TimeSpan.fromMonthDays(28, 2024, 2);
    assert.equal(span.totalDays, 28);
  });

  it('fromMonthDays: rejects overflow', () => {
    assert.throws(() => TimeSpan.fromMonthDays(30, 2024, 2));
  });

  it('fromYearDays: valid leap year', () => {
    const span = TimeSpan.fromYearDays(366, 2024);
    assert.equal(span.totalDays, 366);
  });

  it('fromYearDays: rejects 366 in non-leap', () => {
    assert.throws(() => TimeSpan.fromYearDays(366, 2023));
  });

  it('fromYearDays: rejects 0', () => {
    assert.throws(() => TimeSpan.fromYearDays(0, 2024));
  });
});

// ========== PARSING ==========

describe('TimeSpan.parse', () => {
  it('single unit: days', () => {
    assert.equal(TimeSpan.parse('3d').totalDays, 3);
  });

  it('single unit: hours', () => {
    assert.equal(TimeSpan.parse('12h').totalHours, 12);
  });

  it('single unit: minutes', () => {
    assert.equal(TimeSpan.parse('45m').totalMinutes, 45);
  });

  it('single unit: seconds', () => {
    assert.equal(TimeSpan.parse('30s').totalSeconds, 30);
  });

  it('single unit: weeks', () => {
    assert.equal(TimeSpan.parse('2w').totalDays, 14);
  });

  it('single unit: years (365d approx)', () => {
    assert.equal(TimeSpan.parse('1y').totalDays, 365);
  });

  it('single unit: milliseconds', () => {
    assert.equal(TimeSpan.parse('500ms').totalMilliseconds, 500);
  });

  it('combined units', () => {
    const span = TimeSpan.parse('1d 2h 30m');
    assert.equal(
      span.totalMilliseconds,
      MS_PER_DAY + 2 * MS_PER_HOUR + 30 * MS_PER_MINUTE,
    );
  });

  it('all units together', () => {
    const span = TimeSpan.parse('1y 1w 1d 1h 1m 1s 1ms');
    const expected =
      365 * MS_PER_DAY +
      MS_PER_WEEK +
      MS_PER_DAY +
      MS_PER_HOUR +
      MS_PER_MINUTE +
      MS_PER_SECOND +
      1;
    assert.equal(span.totalMilliseconds, expected);
  });

  it('negative values', () => {
    const span = TimeSpan.parse('-2d');
    assert.equal(span.totalDays, -2);
    assert.equal(span.isNegative, true);
  });

  it('positive sign', () => {
    assert.equal(TimeSpan.parse('+3h').totalHours, 3);
  });

  it('trims whitespace', () => {
    assert.equal(TimeSpan.parse('  2d  ').totalDays, 2);
  });

  it('case insensitive', () => {
    assert.equal(
      TimeSpan.parse('2D 3H').totalMilliseconds,
      2 * MS_PER_DAY + 3 * MS_PER_HOUR,
    );
  });

  it('rejects invalid format', () => {
    assert.throws(() => TimeSpan.parse('abc'));
    assert.throws(() => TimeSpan.parse('2x'));
    assert.throws(() => TimeSpan.parse(''));
  });
});

describe('TimeSpan.fromISO', () => {
  it('basic duration', () => {
    const span = TimeSpan.fromISO('P1DT2H30M');
    assert.equal(
      span.totalMilliseconds,
      MS_PER_DAY + 2 * MS_PER_HOUR + 30 * MS_PER_MINUTE,
    );
  });

  it('years and months (approximate)', () => {
    const span = TimeSpan.fromISO('P1Y2M');
    assert.equal(
      span.totalMilliseconds,
      365 * MS_PER_DAY + 2 * 30 * MS_PER_DAY,
    );
  });

  it('fractional seconds', () => {
    const span = TimeSpan.fromISO('PT1.5S');
    assert.equal(span.totalMilliseconds, 1500);
  });

  it('rejects invalid', () => {
    assert.throws(() => TimeSpan.fromISO('not-iso'));
  });
});

// ========== GETTERS ==========

describe('TimeSpan getters', () => {
  // 1d 2h 3m 4s = decomposed correctly
  const span = TimeSpan.from(
    1 * MS_PER_DAY + 2 * MS_PER_HOUR + 3 * MS_PER_MINUTE + 4 * MS_PER_SECOND,
  );

  it('totalMilliseconds', () => {
    assert.equal(span.totalMilliseconds, 93_784_000);
  });

  it('totalSeconds', () => {
    assert.equal(span.totalSeconds, 93_784);
  });

  it('totalMinutes', () => {
    assert.equal(span.totalMinutes, 1563);
  });

  it('totalHours', () => {
    assert.equal(span.totalHours, 26);
  });

  it('totalDays / days', () => {
    assert.equal(span.totalDays, 1);
    assert.equal(span.days, 1);
  });

  it('hours (remainder)', () => {
    assert.equal(span.hours, 2);
  });

  it('minutes (remainder)', () => {
    assert.equal(span.minutes, 3);
  });

  it('seconds (remainder)', () => {
    assert.equal(span.seconds, 4);
  });

  it('isZero', () => {
    assert.equal(span.isZero, false);
    assert.equal(TimeSpan.zero().isZero, true);
  });

  it('isNegative', () => {
    assert.equal(span.isNegative, false);
    assert.equal(TimeSpan.from(-1).isNegative, true);
  });
});

// ========== ARITHMETIC ==========

describe('TimeSpan arithmetic', () => {
  const a = TimeSpan.fromHours(2);
  const b = TimeSpan.fromHours(3);

  it('plus', () => {
    assert.equal(a.plus(b).totalHours, 5);
  });

  it('minus', () => {
    assert.equal(b.minus(a).totalHours, 1);
  });

  it('minus can go negative', () => {
    assert.equal(a.minus(b).isNegative, true);
  });

  it('times', () => {
    assert.equal(a.times(3).totalHours, 6);
  });

  it('dividedBy', () => {
    assert.equal(TimeSpan.fromHours(6).dividedBy(3).totalHours, 2);
  });
});

// ========== COMPARISON ==========

describe('TimeSpan comparison', () => {
  const short = TimeSpan.fromMinutes(5);
  const long = TimeSpan.fromHours(1);
  const also5m = TimeSpan.fromMinutes(5);

  it('isLongerThan', () => {
    assert.equal(long.isLongerThan(short), true);
    assert.equal(short.isLongerThan(long), false);
  });

  it('isShorterThan', () => {
    assert.equal(short.isShorterThan(long), true);
  });

  it('equals', () => {
    assert.equal(short.equals(also5m), true);
    assert.equal(short.equals(long), false);
  });
});

// ========== INTEROP ==========

describe('TimeSpan interop', () => {
  const span = TimeSpan.fromDays(1);

  it('valueOf returns ms', () => {
    assert.equal(span.valueOf(), MS_PER_DAY);
  });

  it('toJSON returns ms', () => {
    assert.equal(span.toJSON(), MS_PER_DAY);
    assert.equal(JSON.stringify({ ttl: span }), `{"ttl":${MS_PER_DAY}}`);
  });

  it('clone is independent', () => {
    const cloned = span.clone();
    assert.equal(cloned.equals(span), true);
    assert.notEqual(cloned, span);
  });

  it('toString: zero', () => {
    assert.equal(TimeSpan.zero().toString(), '0ms');
  });

  it('toString: single unit', () => {
    assert.equal(TimeSpan.fromDays(3).toString(), '3d');
  });

  it('toString: combined', () => {
    const s = TimeSpan.from(MS_PER_DAY + 2 * MS_PER_HOUR + 30 * MS_PER_MINUTE);
    assert.equal(s.toString(), '1d 2h 30m');
  });

  it('toString: negative', () => {
    assert.equal(
      TimeSpan.from(-MS_PER_HOUR - MS_PER_MINUTE).toString(),
      '-1h 1m',
    );
  });
});
