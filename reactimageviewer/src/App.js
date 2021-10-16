import './App.scss';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const getImages = (getData) => {
  axios.get("https://a7ok2yvaph.execute-api.ap-south-1.amazonaws.com/prod").then(data => {
    getData(data.data);
  });
}

function App() {
  const [data, getData] = useState([]);
  useEffect(() => {
    getImages(getData);
  }, []);

  return (
    <div className="App">
      <ul>
        {data.map(data => <li><img src={data.url} width="200px" style={{ margin: 'auto' }} /><p>{data.name}</p></li>)}
      </ul>
      <div class="light"></div>

    </div>
  );
}

export default App;
