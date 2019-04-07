const buildIterable = available => function* (value) {
  while (available(value)) {
    const next = yield value
    value = next(value)
  }
  return value
}

const years = buildIterable(() => true)
const months = buildIterable(({ month }) => month < 12)

const from ={ year: 2000, month: 10 }
const to = { year: 2001, month: 2 }

const wrap = (iterable, wrapper, handler) => function* (value) {
  const iterator = iterable(value)
  let item = iterator.next(handler)
  while (!item.done) {
    const data = yield * wrapper(item.value)
    item = iterator.next(() => handler(data))
  }
  return item.value
}

const handle = (iterable, next) => function* (value) {
  const iterator = iterable(value)
  let item = iterator.next(next)
  while (!item.done) {
    yield item.value
    item = iterator.next(next)
  }
  return item.value
}

const dateTime = handle(
  wrap(years, months,
    ({ year, month }) => ({ year: year + Math.floor(month/12), month: month%12 })),
  ({ month, ...rest }) => ({ month: month + 1, ...rest }))

const items = []

for (const item of dateTime(from)) {
  items.push(item)
}