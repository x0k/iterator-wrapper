export type wrapper<T, D> = (value: T, data: D) => IterableIterator<T>

export type IterableBuilder<T> = (initialValue: T) => IterableIterator<T>

export const decorate = <T, R extends T> (iterable: IterableBuilder<T>, wrapper: wrapper<R, T>): IterableBuilder<R> => function * (initialValue: R) {
  let value = initialValue
  for (const item of iterable(initialValue)) {
    value = yield * wrapper(value, item)
  }
  return value
}

export const wrap = <T> (iterable: IterableBuilder<T>, available: (value: T) => boolean) => function * (value: T) {
  const iterator = iterable(value)
  let item = iterator.next()
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterator.next()
  }
  return item.value
}
