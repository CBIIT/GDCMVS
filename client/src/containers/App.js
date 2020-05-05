import React, { useState } from 'react';
import { apiSearchAll } from '../api';
import SearchBox from '../components/SearchBox';
import TabsController from '../components/TabsController';
// import { TabContainer, Tab, Row, Nav, Col, Sonnet } from 'react-bootstrap';
// import { Tab, TabContainer, TabContent, Sonnet, TabPane, Row, Col, Nav, NavItem } from 'react-bootstrap';

function App() {
  let [sourceState, setSourceState] = useState([]);

  const searchHandler = (keyword) => {
    apiSearchAll(keyword, {}).then(result => setSourceState(result));
  };

  return (
    <div >
      <SearchBox search={searchHandler}/>
      <TabsController source={sourceState}/>
    </div>
  );
}

export default App;
