import { TBorderChecker, TIteratorBuilder } from './wrapper'

export const buildIterable = <T>(available: TBorderChecker<T>): TIteratorBuilder<T> => function* (value: T) {
  while (available(value)) {
    const next = yield value
    value = next(value)
  }
  return value
}