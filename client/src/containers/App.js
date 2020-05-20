import React, { useState } from 'react';
import styled from 'styled-components';
import { apiSearchAll } from '../api';
// import './App.css';
import SearchBox from '../components/SearchBox';
import TabsController from '../components/TabsController';

const AppContainer = styled.div`
  margin-top: 15px;
`;

function App() {
  let [keywordState, setKeywordState] = useState('');
  let [sourceState, setSourceState] = useState([]);

  const searchHandler = (keyword, options) => {
    setKeywordState(keyword);
    apiSearchAll(keyword, options).then(result => setSourceState(result));
  };

  return (
    <AppContainer>
      <SearchBox searchTrigger={searchHandler}/>
      <TabsController keyword={keywordState} source={sourceState}/>
    </AppContainer>
  );
}

export default App;
