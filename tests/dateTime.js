import test from 'ava'

import { decorate, wrap } from '../build'

const getMonthLength = (year, month) => new Date(year, month + 1, 0).getDate()
const from = { year: 2000, month: 11, day: 30, hour: 23, minute: 48 }
const to = { year: 2001, month: 0, day: 0, hour: 0, minute: 20 }
const condition = ({ year, month, day, hour, minute }) =>
  year < to.year ||
  month < to.month ||
  day < to.day ||
  hour < to.hour ||
  minute <= to.minute

const buildPeriod = (key, lim, step = 1) => function * ({ [key]: value }, date) {
  while (value < lim) {
    yield { [key]: value, ...date }
    value += step
  }
  return { [key]: value % lim }
}

test('Increase year', t => {
  const years = buildPeriod('year', 4000)
  const months = buildPeriod('month', 12)
  function * days ({ day }, { year, month }) {
    const len = getMonthLength(year, month)
    while (day < len) {
      yield { year, month, day: day++ }
    }
    return { day: day % len }
  }
  const hours = buildPeriod('hour', 24)
  const minutes = buildPeriod('minute', 60, 10)

  const dateTime = wrap(
    decorate(decorate(decorate(decorate(years, months), days), hours), minutes),
    condition
  )

  const items = [
    { year: 2000, month: 11, day: 30, hour: 23, minute: 48 },
    { year: 2000, month: 11, day: 30, hour: 23, minute: 58 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 8 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 18 }
  ]

  t.deepEqual([...dateTime(from)], items)
})
