import React, { useState } from 'react';
import styled from 'styled-components';
import { Grid, Row, Col } from 'react-bootstrap';
import { getHighlightObj } from '../shared';

const Container = styled(Grid)`
  font-size: 1.3rem;
  padding-left: 15px;
  padding-right: 15px;
`;

const TableThead = styled(Row)`
  background: #f1f1f1;
`;

const TableTh = styled.div`
  font-weight: 700;
  text-align: left;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const TableBody = styled(Row)`
  overflow-y: auto;
  max-height: 500px;
`;

const TableRow = styled(Row)`
  border-bottom: 1px solid #ecf0f1;
`;

const TableCol = styled(Col)`
  text-align: left;
  padding-top: 12px;
  padding-bottom: 12px;
  line-height: 1.428571;
`;

const PropsTable = (props) => {
  let items = JSON.parse(JSON.stringify(props.properties));
  let properties = [];

  items.forEach(item => {
    if (item.highlight === undefined) return;
    let source = item._source;
    let highlight = item.highlight;

    let highlightProperty = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
    let highlightPropertyObj = getHighlightObj(highlightProperty);

    let highlightPropertyDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
    let highlightPropertyDescObj = {};
    if (highlightPropertyDesc !== undefined) {
      highlightPropertyDesc.forEach(val => {
        if (highlightPropertyDescObj[source.property] === undefined) highlightPropertyDescObj[source.property] = val;
      });
    }

    let highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;
    let highlightCdeIdObj = getHighlightObj(highlightCdeId);

    let propObj = {};
    propObj.category = source.category;
    propObj.node = source.node;
    propObj.id = source.id;
    propObj.property = highlightPropertyObj[source.property] ? highlightPropertyObj[source.property] : source.property;
    propObj.property_desc = highlightPropertyDescObj[source.property] ? highlightPropertyDescObj[source.property] : source.property_desc;
    if (source.type !== undefined && source.type !== '' && source.type !== 'enum') propObj.type = source.type;
    if (source.enum !== undefined) propObj.enum = source.enum;
    if (source.cde !== undefined) {
      propObj.cdeId = highlightCdeIdObj[source.cde.id] ? highlightCdeIdObj[source.cde.id] : source.cde.id;
      propObj.cdeUrl = source.cde.url;
    }
    properties.push(propObj);
  });

  const propsItems = properties.map((item, index) =>
    <TableRow key={index}>
      <TableCol xs={2}>
        {item.category}
        <ul>
          <li>{item.node}</li>
        </ul>
      </TableCol>
      <TableCol xs={2}>
        <a href="#" dangerouslySetInnerHTML={{ __html: item.property }}></a>
      </TableCol>
      <TableCol xs={4} dangerouslySetInnerHTML={{ __html: item.property_desc }}></TableCol>
      <TableCol xs={2}>
        {item.enum !== undefined
          ? <div>
            <a class="getGDCTerms" href="#" data-ref="">See All Values</a><br />
            <a class="toCompare" href="#" data-ref=""> Compare with User List</a>
          </div>
          : <div>{item.type}</div>
        }
      </TableCol>
      <TableCol xs={2}>
        <div></div>
      </TableCol>
    </TableRow>
  );


  return (
    <Container>
      <TableThead>
        <Col xs={2}>
          <TableTh>Category / Node</TableTh>
        </Col>
        <Col xs={2}>
          <TableTh>Property</TableTh>
        </Col>
        <Col xs={4}>
          <TableTh>Description</TableTh>
        </Col>
        <Col xs={2}>
          <TableTh>GDC Property Values</TableTh>
        </Col>
        <Col xs={2}>
          <TableTh>caDSR CDE Reference</TableTh>
        </Col>
      </TableThead>
      <TableBody>
        <Col xs={12}>{propsItems}</Col>
      </TableBody>
    </Container>
  );
};

export default PropsTable;
