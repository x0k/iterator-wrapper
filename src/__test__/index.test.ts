import { wrapIterable, restrictIterable, mapIterable, filterIterable, reduceIterable } from '../index'

type TPredicate<T> = (value: T) => boolean

interface IDictionary<T> {
  [key: string]: T
}

interface IYears extends IDictionary<number> {
  year: number
}

interface IMonths extends IYears {
  month: number
}

interface IDate extends IMonths {
  date: number
  day: number
}

interface IHours extends IDate {
  hour: number
}

interface IMinutes extends IHours {
  minute: number
}

type TIncrementor = (value: number) => number

type TGenerator<T, R> = (incrementor: TIncrementor, condition: TPredicate<R>, value: number, data: T | number) => IterableIterator<number | R>

interface IConstraint<T> {
  step?: number
  expression?: TPredicate<T>
}

function isNumber<T> (data: number | T): data is number {
  return typeof data === 'number'
}

function getMonthLength (year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function withConstraints<T, R>(generator: TGenerator<T, R>, constraint: IConstraint<R> = {}) {
  const { step = 1, expression = () => true } = constraint
  const incrementor = (value: number) => value + step
  return (value: number, data: T | number) => generator(incrementor, expression, value, data)
}

function* yearsIterator(incrementor: TIncrementor, condition: TPredicate<IYears>, startValue: number) {
  let value = startValue
  while (true) {
    const result = { year: value }
    if (condition(result)) {
      yield result
    }
    value = incrementor(value)
  }
}

function* monthsIterator(incrementor: TIncrementor, condition: TPredicate<IMonths>, startValue: number, data: IYears | number) {
  if (isNumber(data)) {
    throw new Error('Type error')
  }
  const { year } = data
  let value = startValue
  while (value < 12) {
    const result = { month: value, year }
    if (condition(result)) {
      yield result
    }
    value = incrementor(value)
  }
  return value % 12
}
function* dateIterator(incrementor: TIncrementor, condition: TPredicate<IDate>, startValue: number, data: IMonths | number) {
  if (isNumber(data)) {
    throw new Error('Type error')
  }
  const { year, month } = data
  const len = getMonthLength(year, month) + 1
  let date = startValue
  let day = new Date(year, month, date).getDay()
  while (date < len) {
    const result = { day, date, month, year }
    if (condition(result)) {
      yield result
    }
    const next = incrementor(date)
    day = (day + next - date) % 7
    date = next
  }
  return date % len + 1
}
function* hoursIterator(incrementor: TIncrementor, condition: TPredicate<IHours>, startValue: number, data: IDate | number) {
  if (isNumber(data)) {
    throw new Error('Type error')
  }
  let value = startValue
  while (value < 24) {
    const result = { hour: value, ...data }
    if (condition(result)) {
      yield result
    }
    value = incrementor(value)
  }
  return value % 24
}

function* minutesIterator(incrementor: TIncrementor, condition: TPredicate<IMinutes>, startValue: number, data: IHours | number) {
  if (isNumber(data)) {
    throw new Error('Type error')
  }
  let value = startValue
  while (value < 60) {
    const result = { minute: value, ...data }
    if (condition(result)) {
      yield result
    }
    value = incrementor(value)
  }
  return value % 60
}

test('Increase year', () => {

  const start = new Date(2000, 11, 31, 23, 48)
  const end = new Date(2001, 0, 1, 0, 20)

  const endYear = end.getFullYear()
  const endMonth = end.getMonth()
  const endDate = end.getDate()
  const endHour = end.getHours()
  const endMinute = end.getMinutes()
  const condition = (date: IMinutes) => (
    date.year < endYear || date.year === endYear && (
      date.month < endMonth || date.month === endMonth && (
        date.day < endDate || date.day === endDate && (
          date.hour < endHour || date.hour === endHour && (
            date.minute <= endMinute
          )
        )
      )
    )
  )

  const years = withConstraints(yearsIterator)
  const months = withConstraints(monthsIterator)
  const date = withConstraints(dateIterator)
  const hours = withConstraints(hoursIterator)
  const minutes = withConstraints(minutesIterator, { step: 10 })

  const dateTime = restrictIterable<IMinutes>(
    mapIterable(
      wrapIterable<IHours | number, number, IMinutes>(
        wrapIterable<IDate | number, number, IHours>(
          wrapIterable<IMonths | number, number, IDate>(
            wrapIterable<IYears | number, number, IMonths>(
              years(start.getFullYear(), {}),
              months,
              start.getMonth()
            ),
            date,
            start.getDate()
          ),
          hours,
          start.getHours()
        ),
        minutes,
        start.getMinutes()
      ),
      (arg) => {
        if (!isNumber(arg)) {
          return arg
        }
        throw new Error('Type error')
      }
    ),
    condition
  )

  const items = [
    { year: 2000, month: 11, date: 31, day: 0, hour: 23, minute: 48 },
    { year: 2000, month: 11, date: 31, day: 0, hour: 23, minute: 58 },
    { year: 2001, month: 0, date: 1, day: 1, hour: 0, minute: 8 },
    { year: 2001, month: 0, date: 1, day: 1, hour: 0, minute: 18 }
  ]

  expect([...dateTime]).toEqual(items)
})

function * forFilter () {
  yield 1
  yield 2
  yield 3
  yield 4
  yield 5
}

function filter (value: number) {
  return value % 2 === 0
}

test('Filter iterable', () => {
  const gen = filterIterable(forFilter(), filter)
  expect([...gen]).toEqual([ 2, 4 ])
})

test('Reduce iterable', () => {

  function * generator () {
    for (let i = 0; i < 12; i++) {
      yield i
    }
  }
  
  function separator (acc: number[]) {
    return acc.length < 4
  }
  
  function reducer (acc: number[], val: number) {
    return acc.concat(val)
  }

  const gen = generator()
  const reduced = reduceIterable(gen, separator, reducer, [])
  expect([...reduced]).toEqual([
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11]
  ])
})