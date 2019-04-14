import test from 'ava'

import { wrap, restrict } from '../build'

const getMonthLength = (year, month) => new Date(year, month + 1, 0).getDate()
const from = { year: 2000, month: 11, day: 30, hour: 23, minute: 48 }
const to = { year: 2001, month: 0, day: 0, hour: 0, minute: 20 }
const condition = ({ year, month, day, hour, minute }) =>
  year < to.year ||
  month < to.month ||
  day < to.day ||
  hour < to.hour ||
  minute <= to.minute

const buildPeriod = (key, lim, step = 1) => function * (value, date) {
  while (value < lim) {
    yield { [key]: value, ...date }
    value += step
  }
  return value % lim
}

test('Increase year', t => {
  const years = buildPeriod('year', 4000)
  const months = buildPeriod('month', 12)
  function * days (value, { year, month }) {
    const len = getMonthLength(year, month)
    while (value < len) {
      yield { year, month, day: value++ }
    }
    return value % len
  }
  const hours = buildPeriod('hour', 24)
  const minutes = buildPeriod('minute', 60, 10)

  const dateTime = restrict(
    wrap(
      wrap(
        wrap(
          wrap(
            years(from.year),
            months,
            from.month
          ),
          days,
          from.day
        ),
        hours,
        from.hour
      ),
      minutes,
      from.minute
    ),
    condition
  )

  const items = [
    { year: 2000, month: 11, day: 30, hour: 23, minute: 48 },
    { year: 2000, month: 11, day: 30, hour: 23, minute: 58 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 8 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 18 }
  ]

  t.deepEqual([...dateTime], items)
})
