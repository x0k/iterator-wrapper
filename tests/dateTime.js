import test from 'ava'
import { wrap, handle, buildIterable } from '../build'

const getMonthLength = (year, month) => new Date(year, month + 1, 0).getDate()
const from = { year: 2000, month: 11, day: 30, hour: 23, minute: 48 }
const to = { year: 2001, month: 0, day: 0, hour: 0, minute: 20 }
const condition = value =>
  value.year < to.year ||
  value.month < to.month ||
  value.day < to.day ||
  value.hour < to.hour ||
  value.minute <= to.minute

test('Increase year', t => {
  const years = buildIterable(() => true)
  const months = buildIterable(({ month }) => month < 12)
  const days = buildIterable(({ year, month, day }) => day < getMonthLength(year, month))
  const hours = buildIterable(({ hour }) => hour < 24)
  const minutes = buildIterable(({ minute }) => minute < 60)

  const dateTime = handle(
    wrap(
      wrap(
        wrap(
          wrap(years, months, ({ year, month, ...rest }) => ({ year: year + Math.floor(month / 12), month: month % 12, ...rest })),
          days,
          ({ year, month, day, ...rest }) => {
            const len = getMonthLength(year, month)
            return { year, month: month + Math.floor(day / len), day: day % len, ...rest }
          }
        ),
        hours,
        ({ day, hour, ...rest }) => ({ day: day + Math.floor(hour / 24), hour: hour % 24, ...rest })
      ),
      minutes,
      ({ hour, minute, ...rest }) => ({ hour: hour + Math.floor(minute / 60), minute: minute % 60, ...rest })
    ),
    ({ minute, ...rest }) => ({ minute: minute + 10, ...rest })
  )

  const items = [
    { year: 2000, month: 11, day: 30, hour: 23, minute: 48 },
    { year: 2000, month: 11, day: 30, hour: 23, minute: 58 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 8 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 18 }
  ]

  t.deepEqual([...dateTime(from, condition)], items)
})
