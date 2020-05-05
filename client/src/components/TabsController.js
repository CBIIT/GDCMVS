import React, { useState } from 'react';
import styled from 'styled-components';
import { Tab, Row, Col, Nav, NavItem } from 'react-bootstrap';

const TabsController = (props) => {
  // let [keyState, setKeyState] = useState(1);

  // const selectHandler = (key) => {
  //   setKeyState(key);
  // };

  const Result = styled.div`
    display: 'none'
    border: 1px solid #dce4ec;
    border-radius: 5px;
    background-color: #fff;
  `;

  const TabNavsCol = styled(Col)`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2em 0;
  `;

  const TabNavText = styled.div`
    color: #535a60;
    max-width: 400px;
    margin-left: 2em;
  `;

  return (
    <Result style={props.source.length !== 0 ? { display: 'block' } : { display: 'block' }}>
      <Tab.Container id="tabs-controller" defaultActiveKey="first">
        <Row className="clearfix">
          <TabNavsCol sm={12}>
            <TabNavText>Result for KEYWORD in</TabNavText>
            <Nav bsStyle="tabs">
              <NavItem eventKey="first">Tab 1</NavItem>
              <NavItem eventKey="second">Tab 2</NavItem>
              <NavItem eventKey="three">Tab 2</NavItem>
            </Nav>
          </TabNavsCol>
          <Col sm={12}>
            <Tab.Content animation>
              <Tab.Pane eventKey="first"><pre>{JSON.stringify(props.source)}</pre></Tab.Pane>
              <Tab.Pane eventKey="second">Tab 2 content</Tab.Pane>
              <Tab.Pane eventKey="three">Tab 3.1 content</Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Result>
  );
};

export default TabsController;
