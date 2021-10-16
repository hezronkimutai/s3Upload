import './App.scss';

import React, { createRef, useEffect, useState } from 'react';
import axios from 'axios';

const getImages = (getData) => {
  axios.get("https://a7ok2yvaph.execute-api.ap-south-1.amazonaws.com/prod").then(data => {
    getData(data.data);
  });
}
const getRandomNo = (max) => Math.round(Math.abs((Math.random() * max) - 4));

function App() {
  const [data, getData] = useState([]);
  const [chuckData, setChunkData] = useState([]);
  const ref = createRef();

  const maxLength = data.length

  useEffect(() => {
    const randomNo = getRandomNo(maxLength);
    const chunk = maxLength > 4 ? data.slice(randomNo, randomNo + 4).splice(0) : data;
    setChunkData(chunk);
  }, [data, setChunkData, maxLength]);

  useEffect(() => {
    getImages(getData);
  }, [getData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomNo = getRandomNo(maxLength);
      setChunkData(data.slice(randomNo, randomNo + 4).splice(0))
    }, 5000);
    return () => clearInterval(interval);
  }, [chuckData, setChunkData, data, maxLength]);
  return (
    <div className="App">
      <ul ref={ref}>
        <h1>Dogs Gallery</h1>
        {chuckData.map((data, index) =>
          <li key={index}>
            <img alt={data.name} src={data.url} style={{ margin: 'auto' }} />
            <p>{data.name}</p>
          </li>)}
      </ul>
      <div class="light"></div>
    </div>
  );
}

export default App;
