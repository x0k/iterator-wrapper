export type wrapper<T, D> = (value: T, data: D) => IterableIterator<T>

export function * decorate<T, R> (iterable: IterableIterator<T>, wrapper: wrapper<R, T>, initialValue: R) {
  let value = initialValue
  for (const item of iterable) {
    value = yield * wrapper(value, item)
  }
  return value
}

export function * wrap<T> (iterable: IterableIterator<T>, available: (value: T) => boolean) {
  let item = iterable.next()
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterable.next()
  }
  return item.value
}
