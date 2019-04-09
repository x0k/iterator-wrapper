export type Wrapper<T> = (value: any, data: T) => IterableIterator<T>

export function * decorate<T> (iterable: IterableIterator<T>, wrapper: Wrapper<T>, value: any) {
  for (const item of iterable) {
    value = yield * wrapper(value, item)
  }
}

export function * wrap<T> (iterable: IterableIterator<T>, available: (value: T) => boolean) {
  let item = iterable.next()
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterable.next()
  }
  return item.value
}
