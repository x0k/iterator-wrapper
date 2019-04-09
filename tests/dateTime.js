import test from 'ava'

import { decorate, wrap } from '../build'

const getMonthLength = (year, month) => new Date(year, month + 1, 0).getDate()
const from = { year: 2000, month: 11, day: 30, hour: 23, minute: 48 }
const to = { year: 2001, month: 0, day: 0, hour: 0, minute: 20 }
const condition = value =>
  value.year < to.year ||
  value.month < to.month ||
  value.day < to.day ||
  value.hour < to.hour ||
  value.minute <= to.minute

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

  const m = decorate(years(from.year), months)
  const d = decorate(m(from.month), days)
  const h = decorate(d(from.day), hours)
  const mn = decorate(h(from.hour), minutes)
  const dateTime = wrap(mn(from.minute), condition)

  const items = [
    { year: 2000, month: 11, day: 30, hour: 23, minute: 48 },
    { year: 2000, month: 11, day: 30, hour: 23, minute: 58 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 8 },
    { year: 2001, month: 0, day: 0, hour: 0, minute: 18 }
  ]

  t.deepEqual([...dateTime], items)
})
