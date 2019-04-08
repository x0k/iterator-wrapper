export type TChecker<T> = (value: T) => boolean;

export type THandler<T> = (value: T) => T;

export type TIteratorBuilder<T> = (value: T) => IterableIterator<T>;

type TIteratorHandler<T> = (
  value: T,
  available: TChecker<T>
) => IterableIterator<T>;

export const wrap = <T>(
  iterable: TIteratorBuilder<T>,
  wrapper: TIteratorBuilder<T>,
  handler: THandler<T>
): TIteratorBuilder<T> =>
  function*(value: T): IterableIterator<T> {
    const iterator = iterable(value);
    let item = iterator.next(handler);
    while (!item.done) {
      const data = yield* wrapper(item.value);
      item = iterator.next((): T => handler(data));
    }
    return item.value;
  };

export const handle = <T>(
  iterable: TIteratorBuilder<T>,
  handler: THandler<T>
): TIteratorHandler<T> =>
  function*(value: T, available: TChecker<T>): IterableIterator<T> {
    const iterator = iterable(value);
    let item = iterator.next(handler);
    while (!item.done && available(item.value)) {
      yield item.value;
      item = iterator.next(handler);
    }
    return item.value;
  };
