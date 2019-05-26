export type TWrapper<T, V, R> = (value: V, data: T) => IterableIterator<R | V>

export type TPredicate<T> = (value: T) => boolean

export function * wrapIterable<T, V, R> (
  iterable: IterableIterator<T>,
  wrapper: TWrapper<T, V, R>,
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
  available: TPredicate<T>,
): IterableIterator<T> {
  for (const item of iterable) {
    if (available(item)) {
      yield item
    } else {
      return item
    }
  }
}

export function * mapIterable<T, R> (
  iterable: IterableIterator<T>,
  callback: (value: T) => R
) {
  for (const value of iterable) {
    yield callback(value)
  }
}

export function * filterIterable<T> (
  iterable: IterableIterator<T>,
  filter: TPredicate<T>,
) {
  for (const item of iterable) {
    if (filter(item)) {
      yield item
    }
  }
}
