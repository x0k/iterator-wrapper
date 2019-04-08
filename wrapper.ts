export type TBorderChecker<T> = (value: T) => boolean

export type THandler<T> = (value: T) => T

export type TIteratorBuilder<T> = (value: T) => IterableIterator<T>

export const wrap = <T>(iterable: TIteratorBuilder<T>, wrapper: TIteratorBuilder<T>, handler: THandler<T>) => function* (value: T) {
  const iterator = iterable(value)
  let item = iterator.next(handler)
  while (!item.done) {
    const data = yield* wrapper(item.value)
    item = iterator.next(() => handler(data))
  }
  return item.value
}

export const handle = <T>(iterable: TIteratorBuilder<T>, handler: THandler<T>) => function* (value: T, available: TBorderChecker<T>) {
  const iterator = iterable(value)
  let item = iterator.next(handler)
  while (!item.done && available(item.value)) {
    yield item.value
    item = iterator.next(handler)
  }
  return item.value
}