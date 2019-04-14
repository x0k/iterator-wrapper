export type wrapper<T, V, R> = (value: V, data: T) => IterableIterator<R | V>

export type IterableBuilder<V, R> = (initialValue: V) => IterableIterator<R | V>

export function * wrap<T, V, R> (iterable: IterableIterator<T>, wrapper: wrapper<T, V, R>, initialValue: V) {
  let value = initialValue
  for (const item of iterable) {
    value = yield * wrapper(value, item)
  }
  return value
}

export function * restrict<T> (iterable: IterableIterator<T>, available: (value: T) => boolean) {
  let item = iterable.next()
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterable.next()
  }
  return item.value
}
