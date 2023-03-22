import { Button, TextareaAutosize } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { concatMap, delay, of } from 'rxjs';
import './App.css';
import { Dimension, Direction, EDirectionSymbol, extractComand, init } from './service';

const DIRECTION_CLASS = {
  [EDirectionSymbol.NORTH]: 'border-up',
  [EDirectionSymbol.EAST]: 'border-right',
  [EDirectionSymbol.SOUTH]: 'border-down',
  [EDirectionSymbol.WEST]: 'border-left'
}

function transformXY(x: number, y: number): [number, number] {  //[0,0] -> [4,0]  // [1,1] -> [3,1] // [1,2] -> [2,1]
  return [4 - y, x]
}


function App() {

  const [area, setArea] = useState<boolean[][]>([])

  const [position, setPosition] = useState<[number, number]>()

  const [finished, setFinished] = useState<boolean>(true)

  const [direction, setDirection] = useState<Direction>()

  const commandInput = useRef<HTMLInputElement>(null)

  const dimensionRef = useRef<Dimension>()

  const defaultVlue = "PLACE 0,0,EAST\nMOVE\nMOVE\nMOVE\nLEFT\nMOVE\nMOVE\nMOVE\nMOVE\nLEFT\nREPORT"

  useEffect(() => {

    dimensionRef.current = init()
    setArea(dimensionRef.current.area)
    dimensionRef.current.stateSubject$.pipe(concatMap((msg) => of(msg).pipe(delay(1000)))).subscribe((data) => {
      setPosition(data.position)
      setDirection(data.direction)
      setFinished(data.finished)
    })
  }, [])

  function execute() {

    const commands = extractComand(commandInput.current?.value as string)

    commands.forEach(([action, params]) => {
      if (action === "PLACE") {
        const args = params.split(',') as string[]
        dimensionRef.current?.placeDirectionAndPosition(args[2] as EDirectionSymbol,
          transformXY(parseInt(args[0]), parseInt(args[1])))
      }
      if (action === "MOVE") {
        dimensionRef.current?.move()
      }
      if (action === 'LEFT') {
        dimensionRef.current?.changeDirection(false)
      }
      if (action === 'RIGHT') {
        dimensionRef.current?.changeDirection(true)
      }
      if (action === 'REPORT') {
        dimensionRef.current?.report()
      }
    })
  }

  const positionX = (position && position[0]) || 0
  const positionY = (position && position[1]) || 0

  const viewXY = transformXY(positionY,positionX)

  return (
    <div className="App">
      <div className='command-box'>
        <TextareaAutosize
          aria-label="minimum height"
          minRows={3}
          placeholder="Minimum 3 rows"
          style={{ width: 200 }}
          defaultValue={defaultVlue}
          ref={commandInput}
        />
        <Button disabled={!finished} onClick={execute} variant="contained">Execute</Button>
      </div>
      <h1>{finished && position && direction ? `${viewXY[1]},${viewXY[0]},${direction.symbol}` : ''}&#8203;</h1>
      <div className='dimension-box'>
        <ul className='row-ctn'>
          {area.map((row, i) => {
            return <li key={i}>
              <ul className='column-ctn'>{row.map((_, j) => {
                const active = position && position[0] === i && position[1] === j
                return <li className={`${active ? `active ${direction?.symbol && DIRECTION_CLASS[direction?.symbol]}` : ''}`} key={`${i},${j}`}></li>
              })}</ul>
            </li>
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
