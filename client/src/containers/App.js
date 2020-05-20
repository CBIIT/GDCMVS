import React, { useState } from 'react';
import { apiSearchAll } from '../api';
import './App.css';
import SearchBox from '../components/SearchBox';
import TabsController from '../components/TabsController';

function App() {
  let [keywordState, setKeywordState] = useState('');
  let [sourceState, setSourceState] = useState([]);

  const searchHandler = (keyword, options) => {
    setKeywordState(keyword);
    apiSearchAll(keyword, options).then(result => setSourceState(result));
  };

  return (
    <div>
      <SearchBox searchTrigger={searchHandler}/>
      <TabsController keyword={keywordState} source={sourceState}/>
    </div>
  );
}

export default App;
