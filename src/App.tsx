import { Button, TextareaAutosize } from '@mui/material';
import { useEffect, useState } from 'react';
import './App.css';
import { init } from './service';

function App() {

  const [area, setArea] = useState<boolean[][]>([])

  useEffect(() => {
    const dimension = init()
    console.log(dimension.area)
    setArea(dimension.area)
  }, [])

  return (
    <div className="App">
      <div className='command-box'>
        <TextareaAutosize
          aria-label="minimum height"
          minRows={3}
          placeholder="Minimum 3 rows"
          style={{ width: 200 }}
        />
        <Button variant="contained">Execute</Button>
      </div>
      <div className='dimension-box'>
        <ul className='row-ctn'>
          {area.map((row, i) => {
            return <li key={i}>
              <ul className='column-ctn'>{row.map((_, j) => {
                return <li key={`${i},${j}`}>{i},{j}</li>
              })}</ul>
            </li>
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
