import React, { useState } from 'react';
import styled from 'styled-components';
import { Tabs, Tab } from 'react-bootstrap';

const TabsController = (props) => {
  let [keyState, setKeyState] = useState(1);

  const selectHandler = (key) => {
    setKeyState(key);
  };

  return (
    <Tabs
      style={props.source.length === 0 ? { display: 'none'} : {}}
      activeKey={keyState}
      onSelect={selectHandler}
      id="controlled-tab-example"
    >
      <Tab eventKey={1} title="Values">
        <pre>{JSON.stringify(props.source)}</pre>
      </Tab>
      <Tab eventKey={2} title="Properties">
        Tab 2 content
      </Tab>
      <Tab eventKey={3} title="Dictionary">
        Tab 3 content
      </Tab>
    </Tabs>
  );
};

export default TabsController;
