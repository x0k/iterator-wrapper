import { TChecker, TIteratorBuilder } from './wrapper'

export const buildIterable = <T>(available: TChecker<T>): TIteratorBuilder<T> =>
  function*(value: T): IterableIterator<T> {
    while (available(value)) {
      const next = yield value
      value = next(value)
    }
    return value
  }
