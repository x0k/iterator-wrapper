const buildIterable = available => function* (value) {
  while (available(value)) {
    const next = yield value
    value = next(value)
  }
  return value
}

const getMonthLength = (year, month) => new Date(year, month + 1, 0).getDate();

const years = buildIterable(() => true)
const months = buildIterable(({ month }) => month < 12)
const days = buildIterable(({ year, month, day }) => day < getMonthLength(year, month))
const hours = buildIterable(({ hour }) => hour < 24)
const minutes = buildIterable(({ minute }) => minute < 60)

const from = { year: 2000, month: 11, day: 29, hour: 23, minute: 58 }
const to = { year: 2001, month: 0, day: 0, hour: 1, minute: 3 }

const wrap = (iterable, handler, wrapper) => function* (value) {
  const iterator = iterable(value)
  let item = iterator.next(handler)
  while (!item.done) {
    if (wrapper) {
      const data = yield* wrapper(item.value)
      item = iterator.next(() => handler(data))
    } else {
      yield item.value
      item = iterator.next(handler)
    }
  }
  return item.value
}

const handle = (iterable, handler, available) => function* (value) {
  const iterator = iterable(value)
  let item = iterator.next(handler)
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterator.next(handler)
  }
  return item.value
}

const dateTime =
handle(
  wrap(
    wrap(
      wrap(
        wrap(
          years,
          ({ year, month, ...rest }) => ({ year: year + Math.floor(month / 12), month: month % 12, ...rest }),
          months
        ),
        ({ year, month, day, ...rest }) => {
          const len = getMonthLength(year, month)
          return { month: month + Math.floor(day/len), day: day%len, ...rest }
        },
        days
      ),
      ({ day, hour, ...rest }) => ({ day: day + Math.floor(hour/24), hour: hour%24, ...rest }),
      hours
    ),
    ({ hour, minute, ...rest }) => ({ hour: hour + Math.floor(minute/60), minute: minute%60, ...rest }),
    minutes
  ),
  ({ minute, ...rest }) => ({ minute: minute + 30, ...rest }),
  ({ year, month, day, hour, minute }) => year < to.year || month < to.month || day < to.day || hour < to.hour || minute <= to.minute
)

const items = []

for (const item of dateTime(from)) {
  items.push(item)
}