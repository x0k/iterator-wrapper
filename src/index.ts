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
  predicate: TPredicate<T>,
) {
  let item = iterable.next()
  while (!item.done && predicate(item.value)) {
    yield item.value
    item = iterable.next()
  }
  return item.value
}

export function * mapIterable<T, R> (
  iterable: IterableIterator<T>,
  callback: (value: T) => R
) {
  let item = iterable.next()
  while (!item.done) {
    yield callback(item.value)
    item = iterable.next()
  }
  return callback(item.value)
}

export function * filterIterable<T> (
  iterable: IterableIterator<T>,
  predicate: TPredicate<T>,
) {
  let item = iterable.next()
  while (!item.done) {
    const { value } =item
    if (predicate(value)) {
      yield value
    }
    item = iterable.next()
  }
  return item.value
}

export function * reduceIterable<T, R> (
  iterable: IterableIterator<T>,
  separator: (previous: R, current: T, index: number) => any,
  reducer: (previous: R, current: T, index: number) => R,
  initialValue: R
) {
  let item = iterable.next()
  let accumulator = initialValue
  let index = 0
  while (!item.done) {
    const { value } = item
    if (separator(accumulator, value, index)) {
      accumulator = reducer(accumulator, value, index)
    } else {
      yield accumulator
      accumulator = reducer(initialValue, value, index)
    }
    index++
    item = iterable.next()
  }
  yield accumulator
}
