export type Wrapper<T, V, R> = (value: V, data: T) => IterableIterator<R | V>

export type Checker<T> = (value: T) => boolean

export function * wrapIterable<T, V, R> (
  iterable: IterableIterator<T>,
  wrapper: Wrapper<T, V, R>,
  initialValue: V
) {
  let value = initialValue
  for (const item of iterable) {
    value = yield * wrapper(value, item)
  }
  return value
}

export function * restrictIterable<T> (
  iterable: IterableIterator<T>,
  available: Checker<T>,
) {
  let item = iterable.next()
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterable.next()
  }
  return item.value
}

export function * castIterableType<T, R> (iterable: IterableIterator<T>, typeCast: (value: T) => R) {
  for (const value of iterable) {
    yield typeCast(value)
  }
}
