import { ReplaySubject } from "rxjs"

enum EDirectionSymbol {
  NORTH = "NORTH", WEST = 'WEST', SOUTH = 'SOUTH', EAST = 'EAST',
}

type TDirectionChain = { [key in EDirectionSymbol]: Direction }

class Direction {
  public symbol: EDirectionSymbol
  public pre: Direction | null
  public next: Direction | null
  constructor(symbol: EDirectionSymbol, pre: Direction | null, next: Direction | null) {
    this.symbol = symbol
    this.pre = pre
    this.next = next
  }
}


class Dimension {

  private direction: Direction

  public position: [number, number]

  public area: Array<Array<any>>

  private directionMap: TDirectionChain

  public placeInitialized$ = new ReplaySubject<boolean>(1)

  constructor(directionMap: TDirectionChain) {
    this.directionMap = directionMap;
    this.area = this.buildDimension()
  }

  public buildDimension() {
    const rowNum = 5
    const columnNum = 5

    return new Array(rowNum).fill(true).map(() => {
      return new Array(columnNum).fill(true)
    })
  }

  public placeDirection(direction: EDirectionSymbol) {
    this.direction = this.directionMap[direction]
    if (this.position) {
      this.placeInitialized$.next(true)
    }
  }

  public placePosition(position: [number, number]) {
    this.position = position
    if (this.direction) {
      this.placeInitialized$.next(true)
    }
  }

  public changeDirection(isNext: boolean) {
    if (isNext) {
      this.direction = this.direction.next as Direction
    } else {
      this.direction = this.direction.pre as Direction
    }
  }

  public move() {
    if (this.direction.symbol === EDirectionSymbol.NORTH) {
      const northValid = !!this.area[this.position[0] - 1]
      if (northValid) {
        this.position = [this.position[0] - 1, this.position[1]]
      }
    }
    if (this.direction.symbol === EDirectionSymbol.WEST) {
      const westValid = !!this.area[this.position[0]][this.position[1] - 1]
      if (westValid) {
        this.position = [this.position[0], this.position[1] - 1]
      }
    }
    if (this.direction.symbol === EDirectionSymbol.SOUTH) {
      const southValid = !!this.area[this.position[0] + 1]
      if (southValid) {
        this.position = [this.position[0] + 1, this.position[1]]
      }
    }
    if (this.direction.symbol === EDirectionSymbol.EAST) {
      const eastValid = !!this.area[this.position[0]][this.position[1] + 1]
      if (eastValid) {
        this.position = [this.position[0], this.position[1] + 1]
      }
    }
    return this.position
  }
}



function buildDirectionChain() {
  const chainItems = [EDirectionSymbol.NORTH, EDirectionSymbol.WEST, EDirectionSymbol.SOUTH, EDirectionSymbol.EAST]
  const directionInfo = chainItems.reduce((accumulator, cur, index) => {
    const direction = new Direction(cur, null, null)
    accumulator.chainMap[cur] = direction
    if (!accumulator.first) {
      accumulator.first = direction
    }
    if (accumulator.last) {
      accumulator.last.next = direction
      direction.pre = accumulator.last
    }
    accumulator.last = direction

    if (index === chainItems.length - 1) {
      // link first and last one, building a circle chain
      accumulator.first.pre = accumulator.last
      accumulator.last.next = accumulator.first
    }

    return accumulator
  }, { first: null, chainMap: {}, last: null } as { first: Direction | null, chainMap: TDirectionChain, last: Direction | null })

  return directionInfo.chainMap
}


export function init() {
  const directionChain = buildDirectionChain()
  return new Dimension(directionChain)
}
