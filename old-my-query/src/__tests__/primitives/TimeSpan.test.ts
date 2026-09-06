import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DateTime,
  isLeapYear,
  getDaysInMonth,
  isValidDate,
  getMonthName,
  getYearDifference,
  DAYS_IN_WEEK,
  MONTHS_IN_YEAR,
} from '@/mini-stack/primitives/date-time';
import { TimeSpan } from '@/mini-stack/primitives/time-span';

// ========== UTILITY FUNCTIONS ==========

describe('isLeapYear', () => {
  it('2024 is leap', () => assert.equal(isLeapYear(2024), true));
  it('2023 is not leap', () => assert.equal(isLeapYear(2023), false));
  it('2000 is leap (divisible by 400)', () => assert.equal(isLeapYear(2000), true));
  it('1900 is not leap (divisible by 100 not 400)', () => assert.equal(isLeapYear(1900), false));
});

describe('getDaysInMonth', () => {
  it('January = 31', () => assert.equal(getDaysInMonth(2024, 1), 31));
  it('Feb 2024 (leap) = 29', () => assert.equal(getDaysInMonth(2024, 2), 29));
  it('Feb 2023 (non-leap) = 28', () => assert.equal(getDaysInMonth(2023, 2), 28));
  it('April = 30', () => assert.equal(getDaysInMonth(2024, 4), 30));
  it('rejects month 0', () => assert.throws(() => getDaysInMonth(2024, 0)));
  it('rejects month 13', () => assert.throws(() => getDaysInMonth(2024, 13)));
});

describe('isValidDate', () => {
  it('valid date', () => assert.equal(isValidDate(2024, 3, 15), true));
  it('Feb 29 in leap year', () => assert.equal(isValidDate(2024, 2, 29), true));
  it('Feb 29 in non-leap year', () => assert.equal(isValidDate(2023, 2, 29), false));
  it('day 0', () => assert.equal(isValidDate(2024, 1, 0), false));
  it('day 32', () => assert.equal(isValidDate(2024, 1, 32), false));
});

describe('getMonthName', () => {
  it('returns month name in pt-BR', () => {
    const name = getMonthName(1, 'pt-BR');
    assert.equal(name, 'janeiro');
  });

  it('returns month name in en-US', () => {
    const name = getMonthName(1, 'en-US');
    assert.equal(name, 'January');
  });
});

describe('getYearDifference', () => {
  it('same year, later month', () => {
    const a = DateTime.create(2024, 1, 1);
    const b = DateTime.create(2024, 6, 1);
    assert.equal(getYearDifference(a, b), 0);
  });

  it('full year apart', () => {
    const a = DateTime.create(2023, 1, 1);
    const b = DateTime.create(2024, 1, 1);
    assert.equal(getYearDifference(a, b), 1);
  });

  it('almost a year (should be 0)', () => {
    const a = DateTime.create(2023, 3, 15);
    const b = DateTime.create(2024, 3, 14);
    assert.equal(getYearDifference(a, b), 0);
  });
});

describe('constants', () => {
  it('DAYS_IN_WEEK = 7', () => assert.equal(DAYS_IN_WEEK, 7));
  it('MONTHS_IN_YEAR = 12', () => assert.equal(MONTHS_IN_YEAR, 12));
});

// ========== STATIC FACTORIES ==========

describe('DateTime.now', () => {
  it('returns current time', () => {
    const before = Date.now();
    const dt = DateTime.now();
    const after = Date.now();
    assert.ok(dt.timestamp >= before && dt.timestamp <= after);
  });
});

describe('DateTime.today', () => {
  it('has zeroed time', () => {
    const t = DateTime.today();
    assert.equal(t.hour, 0);
    assert.equal(t.minute, 0);
    assert.equal(t.second, 0);
    assert.equal(t.millisecond, 0);
  });
});

describe('DateTime.tomorrow / yesterday', () => {
  it('tomorrow is today + 1d', () => {
    const today = DateTime.today();
    const tom = DateTime.tomorrow();
    assert.equal(tom.diff(today).totalDays, 1);
  });

  it('yesterday is today - 1d', () => {
    const today = DateTime.today();
    const yest = DateTime.yesterday();
    assert.equal(today.diff(yest).totalDays, 1);
  });
});

describe('DateTime.fromDate', () => {
  it('creates from native Date', () => {
    const native = new Date(Date.UTC(2024, 2, 15, 10, 30));
    const dt = DateTime.fromDate(native);
    assert.equal(dt.year, 2024);
    assert.equal(dt.month, 3);
    assert.equal(dt.day, 15);
    assert.equal(dt.hour, 10);
    assert.equal(dt.minute, 30);
  });

  it('is a defensive copy', () => {
    const native = new Date(Date.UTC(2024, 0, 1));
    const dt = DateTime.fromDate(native);
    native.setUTCFullYear(2000);
    assert.equal(dt.year, 2024);
  });
});

describe('DateTime.fromTimestamp', () => {
  it('creates from ms', () => {
    const ts = Date.UTC(2024, 0, 1);
    const dt = DateTime.fromTimestamp(ts);
    assert.equal(dt.year, 2024);
    assert.equal(dt.month, 1);
    assert.equal(dt.day, 1);
  });
});

describe('DateTime.fromISO', () => {
  it('parses valid ISO', () => {
    const dt = DateTime.fromISO('2024-03-15T10:30:00.000Z');
    assert.equal(dt.year, 2024);
    assert.equal(dt.month, 3);
    assert.equal(dt.day, 15);
    assert.equal(dt.hour, 10);
    assert.equal(dt.minute, 30);
  });

  it('rejects invalid ISO', () => {
    assert.throws(() => DateTime.fromISO('not-a-date'));
  });
});

describe('DateTime.create', () => {
  it('creates with all params', () => {
    const dt = DateTime.create(2024, 6, 15, 14, 30, 45, 123);
    assert.equal(dt.year, 2024);
    assert.equal(dt.month, 6);
    assert.equal(dt.day, 15);
    assert.equal(dt.hour, 14);
    assert.equal(dt.minute, 30);
    assert.equal(dt.second, 45);
    assert.equal(dt.millisecond, 123);
  });

  it('defaults to day 1 and time 0', () => {
    const dt = DateTime.create(2024, 3);
    assert.equal(dt.day, 1);
    assert.equal(dt.hour, 0);
  });

  it('rejects invalid date', () => {
    assert.throws(() => DateTime.create(2023, 2, 29));
  });
});

describe('DateTime.in', () => {
  it('creates future DateTime', () => {
    const base = DateTime.create(2024, 1, 1, 0, 0, 0);
    const result = DateTime.in('2d 3h', base);
    assert.equal(result.day, 3);
    assert.equal(result.hour, 3);
  });

  it('works with default (now)', () => {
    const before = Date.now();
    const result = DateTime.in('1h');
    const after = Date.now();
    const expected = before + 3_600_000;
    assert.ok(result.timestamp >= expected && result.timestamp <= after + 3_600_000);
  });
});

// ========== STATIC BOUNDARIES ==========

describe('DateTime static boundaries', () => {
  it('startOfDay is midnight today', () => {
    const sod = DateTime.startOfDay();
    const today = DateTime.today();
    assert.equal(sod.isSameDay(today), true);
    assert.equal(sod.hour, 0);
    assert.equal(sod.minute, 0);
  });

  it('endOfDay is 23:59:59.999 today', () => {
    const eod = DateTime.endOfDay();
    assert.equal(eod.hour, 23);
    assert.equal(eod.minute, 59);
    assert.equal(eod.second, 59);
    assert.equal(eod.millisecond, 999);
  });

  it('startOfMonth is day 1', () => {
    const som = DateTime.startOfMonth();
    assert.equal(som.day, 1);
    assert.equal(som.hour, 0);
  });

  it('endOfMonth has correct last day', () => {
    const eom = DateTime.endOfMonth();
    const now = DateTime.now();
    const expected = getDaysInMonth(now.year, now.month);
    assert.equal(eom.day, expected);
    assert.equal(eom.hour, 23);
  });

  it('startOfYear is Jan 1', () => {
    const soy = DateTime.startOfYear();
    assert.equal(soy.month, 1);
    assert.equal(soy.day, 1);
  });

  it('endOfYear is Dec 31', () => {
    const eoy = DateTime.endOfYear();
    assert.equal(eoy.month, 12);
    assert.equal(eoy.day, 31);
    assert.equal(eoy.hour, 23);
  });

  it('startOfWeek is Sunday', () => {
    const sow = DateTime.startOfWeek();
    assert.equal(sow.dayOfWeek, 0); // Sunday
  });

  it('endOfWeek is Saturday', () => {
    const eow = DateTime.endOfWeek();
    assert.equal(eow.dayOfWeek, 6); // Saturday
  });
});

// ========== UTC GETTERS ==========

describe('DateTime UTC getters', () => {
  const dt = DateTime.create(2024, 3, 15, 14, 30, 45, 123);

  it('year', () => assert.equal(dt.year, 2024));
  it('month (1-indexed)', () => assert.equal(dt.month, 3));
  it('day', () => assert.equal(dt.day, 15));
  it('hour', () => assert.equal(dt.hour, 14));
  it('minute', () => assert.equal(dt.minute, 30));
  it('second', () => assert.equal(dt.second, 45));
  it('millisecond', () => assert.equal(dt.millisecond, 123));
  it('dayOfWeek (Friday=5)', () => assert.equal(dt.dayOfWeek, 5));
  it('timestamp', () => {
    assert.equal(dt.timestamp, Date.UTC(2024, 2, 15, 14, 30, 45, 123));
  });
});

// ========== LOCAL GETTERS ==========

describe('DateTime local getters', () => {
  it('localYear returns local timezone year', () => {
    const dt = DateTime.now();
    assert.equal(dt.localYear, new Date().getFullYear());
  });

  it('localMonth returns local timezone month (1-indexed)', () => {
    const dt = DateTime.now();
    assert.equal(dt.localMonth, new Date().getMonth() + 1);
  });

  it('localDay returns local timezone day', () => {
    const dt = DateTime.now();
    assert.equal(dt.localDay, new Date().getDate());
  });

  it('localHour returns local timezone hour', () => {
    const dt = DateTime.now();
    assert.equal(dt.localHour, new Date().getHours());
  });
});

// ========== ARITHMETIC: plus/minus with TimeSpan ==========

describe('DateTime plus/minus TimeSpan', () => {
  const base = DateTime.create(2024, 1, 15, 12, 0, 0);

  it('plus adds duration', () => {
    const result = base.plus(TimeSpan.fromHours(3));
    assert.equal(result.hour, 15);
  });

  it('minus subtracts duration', () => {
    const result = base.minus(TimeSpan.fromHours(3));
    assert.equal(result.hour, 9);
  });

  it('diff returns absolute difference', () => {
    const a = DateTime.create(2024, 1, 1);
    const b = DateTime.create(2024, 1, 4);
    assert.equal(a.diff(b).totalDays, 3);
    assert.equal(b.diff(a).totalDays, 3); // absolute
  });
});

// ========== ARITHMETIC: plusUnit / minusUnit ==========

describe('DateTime plusUnit methods', () => {
  const base = DateTime.create(2024, 1, 15, 10, 30, 45, 100);

  it('plusMilliseconds', () => {
    assert.equal(base.plusMilliseconds(500).millisecond, 600);
  });

  it('plusSeconds', () => {
    assert.equal(base.plusSeconds(15).second, 0); // 45+15=60 → 0
    assert.equal(base.plusSeconds(15).minute, 31);
  });

  it('plusMinutes', () => {
    assert.equal(base.plusMinutes(30).hour, 11);
    assert.equal(base.plusMinutes(30).minute, 0);
  });

  it('plusHours', () => {
    assert.equal(base.plusHours(14).hour, 0);
    assert.equal(base.plusHours(14).day, 16);
  });

  it('plusDays', () => {
    assert.equal(base.plusDays(20).day, 4);
    assert.equal(base.plusDays(20).month, 2);
  });

  it('plusWeeks', () => {
    assert.equal(base.plusWeeks(2).day, 29);
  });

  it('plusMonths: normal', () => {
    assert.equal(base.plusMonths(2).month, 3);
    assert.equal(base.plusMonths(2).day, 15);
  });

  it('plusMonths: day clamping (Jan 31 + 1 month)', () => {
    const jan31 = DateTime.create(2024, 1, 31);
    const result = jan31.plusMonths(1);
    assert.equal(result.month, 2);
    assert.equal(result.day, 29); // 2024 is leap
  });

  it('plusMonths: year rollover', () => {
    const nov = DateTime.create(2024, 11, 15);
    assert.equal(nov.plusMonths(3).month, 2);
    assert.equal(nov.plusMonths(3).year, 2025);
  });

  it('plusMonths: negative', () => {
    assert.equal(base.plusMonths(-1).month, 12);
    assert.equal(base.plusMonths(-1).year, 2023);
  });

  it('plusYears', () => {
    assert.equal(base.plusYears(2).year, 2026);
  });

  it('plusYears: Feb 29 to non-leap year', () => {
    const feb29 = DateTime.create(2024, 2, 29);
    const result = feb29.plusYears(1);
    assert.equal(result.month, 2);
    assert.equal(result.day, 28); // 2025 is not leap
  });
});

describe('DateTime minusUnit methods', () => {
  const base = DateTime.create(2024, 3, 15, 10, 30, 0);

  it('minusMilliseconds', () => {
    assert.equal(base.minusMilliseconds(100).millisecond, 900);
  });

  it('minusSeconds', () => {
    assert.equal(base.minusSeconds(30).second, 30);
    assert.equal(base.minusSeconds(30).minute, 29);
  });

  it('minusMinutes', () => {
    assert.equal(base.minusMinutes(30).hour, 10);
    assert.equal(base.minusMinutes(30).minute, 0);
  });

  it('minusHours', () => {
    assert.equal(base.minusHours(11).hour, 23);
    assert.equal(base.minusHours(11).day, 14);
  });

  it('minusDays', () => {
    assert.equal(base.minusDays(15).day, 29);
    assert.equal(base.minusDays(15).month, 2);
  });

  it('minusWeeks', () => {
    assert.equal(base.minusWeeks(2).day, 1);
  });

  it('minusMonths', () => {
    assert.equal(base.minusMonths(2).month, 1);
  });

  it('minusYears', () => {
    assert.equal(base.minusYears(1).year, 2023);
  });
});

// ========== INSTANCE BOUNDARIES ==========

describe('DateTime instance boundaries', () => {
  const dt = DateTime.create(2024, 3, 15, 14, 30, 45, 123);

  it('startOfDay', () => {
    const s = dt.startOfDay();
    assert.equal(s.day, 15);
    assert.equal(s.hour, 0);
    assert.equal(s.minute, 0);
    assert.equal(s.second, 0);
    assert.equal(s.millisecond, 0);
  });

  it('endOfDay', () => {
    const e = dt.endOfDay();
    assert.equal(e.day, 15);
    assert.equal(e.hour, 23);
    assert.equal(e.minute, 59);
    assert.equal(e.second, 59);
    assert.equal(e.millisecond, 999);
  });

  it('startOfWeek: 2024-03-15 (Friday) → 2024-03-10 (Sunday)', () => {
    const s = dt.startOfWeek();
    assert.equal(s.day, 10);
    assert.equal(s.dayOfWeek, 0);
    assert.equal(s.hour, 0);
  });

  it('endOfWeek: → 2024-03-16 (Saturday)', () => {
    const e = dt.endOfWeek();
    assert.equal(e.day, 16);
    assert.equal(e.dayOfWeek, 6);
    assert.equal(e.hour, 23);
  });

  it('startOfMonth', () => {
    const s = dt.startOfMonth();
    assert.equal(s.day, 1);
    assert.equal(s.month, 3);
    assert.equal(s.hour, 0);
  });

  it('endOfMonth: March has 31 days', () => {
    const e = dt.endOfMonth();
    assert.equal(e.day, 31);
    assert.equal(e.month, 3);
    assert.equal(e.hour, 23);
  });

  it('endOfMonth: Feb 2024 (leap)', () => {
    const feb = DateTime.create(2024, 2, 10);
    assert.equal(feb.endOfMonth().day, 29);
  });

  it('endOfMonth: Feb 2023 (non-leap)', () => {
    const feb = DateTime.create(2023, 2, 10);
    assert.equal(feb.endOfMonth().day, 28);
  });

  it('startOfYear', () => {
    const s = dt.startOfYear();
    assert.equal(s.month, 1);
    assert.equal(s.day, 1);
    assert.equal(s.year, 2024);
    assert.equal(s.hour, 0);
  });

  it('endOfYear', () => {
    const e = dt.endOfYear();
    assert.equal(e.month, 12);
    assert.equal(e.day, 31);
    assert.equal(e.year, 2024);
    assert.equal(e.hour, 23);
  });
});

// ========== COMPARISON ==========

describe('DateTime comparison', () => {
  const a = DateTime.create(2024, 1, 1, 12, 0, 0);
  const b = DateTime.create(2024, 6, 15, 18, 30, 0);
  const a2 = DateTime.create(2024, 1, 1, 12, 0, 0);

  it('isAfter', () => {
    assert.equal(b.isAfter(a), true);
    assert.equal(a.isAfter(b), false);
  });

  it('isBefore', () => {
    assert.equal(a.isBefore(b), true);
    assert.equal(b.isBefore(a), false);
  });

  it('isSame', () => {
    assert.equal(a.isSame(a2), true);
    assert.equal(a.isSame(b), false);
  });

  it('isSameDay', () => {
    const sameDay = DateTime.create(2024, 1, 1, 23, 59, 59);
    assert.equal(a.isSameDay(sameDay), true);
    assert.equal(a.isSameDay(b), false);
  });

  it('isSameMonth', () => {
    const sameMonth = DateTime.create(2024, 1, 25);
    assert.equal(a.isSameMonth(sameMonth), true);
    assert.equal(a.isSameMonth(b), false);
  });

  it('isSameYear', () => {
    assert.equal(a.isSameYear(b), true);
    assert.equal(a.isSameYear(DateTime.create(2023, 1, 1)), false);
  });

  it('isFuture / isPast', () => {
    const past = DateTime.create(2020, 1, 1);
    const future = DateTime.create(2099, 1, 1);
    assert.equal(past.isPast(), true);
    assert.equal(past.isFuture(), false);
    assert.equal(future.isFuture(), true);
    assert.equal(future.isPast(), false);
  });

  it('isToday', () => {
    assert.equal(DateTime.today().isToday(), true);
    assert.equal(DateTime.create(2020, 1, 1).isToday(), false);
  });

  it('isLeapYear', () => {
    assert.equal(DateTime.create(2024, 1, 1).isLeapYear(), true);
    assert.equal(DateTime.create(2023, 1, 1).isLeapYear(), false);
  });
});

// ========== FORMATTING ==========

describe('DateTime format', () => {
  const dt = DateTime.create(2024, 3, 15, 14, 30, 0);

  it('format with locale param', () => {
    const result = dt.format({ year: 'numeric', month: 'long' }, 'en-US');
    assert.ok(result.includes('March'));
    assert.ok(result.includes('2024'));
  });

  it('format defaults to pt-BR', () => {
    const result = dt.format({ month: 'long' });
    assert.equal(result, 'março');
  });

  it('toThinkingDate', () => {
    const result = dt.toThinkingDate('en-US');
    assert.ok(result.includes('Friday'));
    assert.ok(result.includes('March'));
  });
});

// ========== DATE PASS-THROUGH ==========

describe('DateTime Date pass-through', () => {
  const dt = DateTime.create(2024, 3, 15, 14, 30, 0);

  it('toLocaleString returns non-empty', () => {
    assert.ok(dt.toLocaleString().length > 0);
  });

  it('toLocaleDateString returns non-empty', () => {
    assert.ok(dt.toLocaleDateString().length > 0);
  });

  it('toLocaleTimeString returns non-empty', () => {
    assert.ok(dt.toLocaleTimeString().length > 0);
  });

  it('toDateString', () => {
    assert.ok(dt.toDateString().includes('2024'));
  });

  it('toTimeString', () => {
    assert.ok(dt.toTimeString().length > 0);
  });

  it('toUTCString', () => {
    const result = dt.toUTCString();
    assert.ok(result.includes('15'));
    assert.ok(result.includes('2024'));
  });
});

// ========== UTC STRINGS ==========

describe('DateTime UTC strings', () => {
  const dt = DateTime.create(2024, 3, 5, 9, 5, 7, 42);

  it('toISOString', () => {
    assert.equal(dt.toISOString(), '2024-03-05T09:05:07.042Z');
  });

  it('toUTCDateString (zero-padded)', () => {
    assert.equal(dt.toUTCDateString(), '2024-03-05');
  });

  it('toUTCTimeString: HH', () => {
    assert.equal(dt.toUTCTimeString('HH'), '09');
  });

  it('toUTCTimeString: HH:mm', () => {
    assert.equal(dt.toUTCTimeString('HH:mm'), '09:05');
  });

  it('toUTCTimeString: HH:mm:ss (default)', () => {
    assert.equal(dt.toUTCTimeString(), '09:05:07');
  });

  it('toUTCTimeString: HH:mm:ss.SSS', () => {
    assert.equal(dt.toUTCTimeString('HH:mm:ss.SSS'), '09:05:07.042');
  });
});

// ========== ZONED STRINGS ==========

describe('DateTime zoned strings', () => {
  // Use a known UTC time — zoned output depends on system TZ
  // but format should always be correct
  const dt = DateTime.create(2024, 3, 15, 14, 30, 0);

  it('toZonedDateString: YYYY-MM-DD format', () => {
    const result = dt.toZonedISODateString();
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('toZonedTimeString: HH:mm format', () => {
    const result = dt.toZonedISOTimeString();
    assert.match(result, /^\d{2}:\d{2}$/);
  });

  it('toZonedDateTimeString: YYYY-MM-DDTHH:mm format', () => {
    const result = dt.toZonedISODateTimeString();
    assert.match(result, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('toZonedDateTimeString is composition of date + time', () => {
    const result = dt.toZonedISODateTimeString();
    assert.equal(result, `${dt.toZonedISODateString()}T${dt.toZonedISOTimeString()}`);
  });

  it('toZonedDateString pads single digits', () => {
    const dt2 = DateTime.create(2024, 1, 5, 3, 7, 0);
    // In UTC, this is Jan 5 — in any TZ it should still be padded
    const result = dt2.toZonedISODateString();
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
    // No single-digit months or days
    const parts = result.split('-');
    assert.equal(parts[1].length, 2);
    assert.equal(parts[2].length, 2);
  });
});

// ========== INTEROP ==========

describe('DateTime interop', () => {
  const dt = DateTime.create(2024, 3, 15, 14, 30, 0);

  it('toDate returns native Date copy', () => {
    const native = dt.toDate();
    assert.ok(native instanceof Date);
    assert.equal(native.getTime(), dt.timestamp);
    // mutating the copy doesn't affect DateTime
    native.setUTCFullYear(2000);
    assert.equal(dt.year, 2024);
  });

  it('toJSON returns ISO', () => {
    assert.equal(dt.toJSON(), dt.toISOString());
  });

  it('JSON.stringify uses toJSON', () => {
    const json = JSON.stringify({ date: dt });
    assert.ok(json.includes('2024-03-15'));
  });

  it('valueOf returns timestamp', () => {
    assert.equal(dt.valueOf(), dt.timestamp);
  });

  it('toString returns ISO', () => {
    assert.equal(dt.toString(), dt.toISOString());
  });

  it('clone is independent', () => {
    const cloned = dt.clone();
    assert.equal(cloned.isSame(dt), true);
    assert.notEqual(cloned, dt);
  });
});

// ========== IMMUTABILITY ==========

describe('DateTime immutability', () => {
  it('plusDays does not mutate original', () => {
    const original = DateTime.create(2024, 1, 15);
    const result = original.plusDays(5);
    assert.equal(original.day, 15);
    assert.equal(result.day, 20);
  });

  it('startOfDay does not mutate original', () => {
    const original = DateTime.create(2024, 1, 15, 14, 30);
    const result = original.startOfDay();
    assert.equal(original.hour, 14);
    assert.equal(result.hour, 0);
  });

  it('plusMonths does not mutate original', () => {
    const original = DateTime.create(2024, 1, 31);
    const result = original.plusMonths(1);
    assert.equal(original.day, 31);
    assert.equal(result.day, 29);
  });
});