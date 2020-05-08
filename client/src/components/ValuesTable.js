import React, { useState } from 'react';
import styled from 'styled-components';
import { Grid, Row, Col, Table, Glyphicon } from 'react-bootstrap';
import { getHighlightObj, sortAlphabetically, sortSynonyms } from '../shared';

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

const TableRowFlex = styled(TableRow)`
  display: flex;
  align-items: stretch;
`;

const TableCol = styled(Col)`
  text-align: left;
  padding-top: 12px;
  padding-bottom: 12px;
  line-height: 1.428571;
`;

const TableColFlex = styled(TableCol)`
  display: flex;
  align-items: stretch;
`;

const TableValues = styled(Col)`
  border-left: 1px solid #ecf0f1;
`;

const ColRight = styled(Col)`
  text-align: right;
`;

const ValuesTable = (props) => {
  let termTypeNotAssigned = false;
  let valuesCount = 0;

  let items = JSON.parse(JSON.stringify(props.values));

  let values = [];

  items.forEach((data, index) => {
    let enums = data.inner_hits.enum;
    if (enums.hits.total !== 0) { // If the searched term is cde id.
      let enumHits = enums.hits.hits;
      let obj = {};
      obj.category = data._source.category;
      obj.node = data._source.node;
      obj.property = data._source.property;
      obj.id = data._source.id;
      obj.cdeId = data._source.cde ? data._source.cde.id : undefined;
      obj.cdeUrl = data._source.cde ? data._source.cde.url : undefined;
      obj.vs = [];
      let highlightCdeId = data.highlight !== undefined && ('cde.id' in data.highlight) ? data.highlight['cde.id'] : undefined;
      // if (highlightCdeId !== undefined) {
      //   if (data._source.enum !== undefined) obj.vs = getAllValues(data);
      // }
      enumHits.forEach(hits => {
        let highlight = hits.highlight;

        let highlightValue = ('enum.n' in highlight) || ('enum.n.have' in highlight) ? highlight['enum.n'] || highlight['enum.n.have'] : undefined;
        let highlightValueObj = getHighlightObj(highlightValue);

        let highlightSyn = ('enum.n_syn.s.termName' in highlight) || ('enum.n_syn.s.termName.have' in highlight) ? highlight['enum.n_syn.s.termName'] || highlight['enum.n_syn.s.termName.have'] : undefined;
        let highlightSynObj = getHighlightObj(highlightSyn);

        let highlightNC = ('enum.n_syn.n_c' in highlight) || ('enum.n_syn.n_c.have' in highlight) ? highlight['enum.n_syn.n_c'] || highlight['enum.n_syn.n_c.have'] : undefined;
        let highlightNCObj = getHighlightObj(highlightNC);

        let highlightIC = ('enum.i_c.c' in highlight) || ('enum.i_c.have' in highlight) ? highlight['enum.i_c.c'] || highlight['enum.i_c.have'] : undefined;
        let highlightICObj = getHighlightObj(highlightIC);

        if (highlightCdeId === undefined) {
          let valueObj = {};
          let source = hits._source;
          valueObj.n = highlightValueObj[source.n] !== undefined ? highlightValueObj[source.n] : source.n;
          valueObj.src_n = source.n;
          valueObj.drug = source.drug;
          if (source.n_syn !== undefined) {
            source.n_syn.forEach(data => {
              let newSyn = [];
              let preferredTerm;
              data.s.forEach(s => {
                if (s.termSource !== 'NCI') return;
                let synObj = {};
                synObj.termName = highlightSynObj[s.termName] ? highlightSynObj[s.termName] : s.termName;
                synObj.termSource = s.termSource;
                synObj.termGroup = s.termGroup;
                if (s.termGroup === 'PT' && preferredTerm === undefined) {
                  preferredTerm = s.termName;
                }
                newSyn.push(synObj);
              });
              data.n_c = highlightNCObj[data.n_c] ? highlightNCObj[data.n_c] : data.n_c;
              data.id = (obj.property + '-' + valueObj.src_n + '-' + data.n_c).replace(/[^a-zA-Z0-9-]+/gi, '');
              data.pt = preferredTerm;
              data.s = sortSynonyms(newSyn);
              if (data.def !== undefined &&
                data.def.length !== 0 &&
                data.def.find((defs) => defs.defSource === 'NCI') !== undefined) {
                data.def = data.def.find((defs) => defs.defSource === 'NCI').description;
              } else {
                data.def = undefined;
              }
              if (data.ap !== undefined && data.ap.length !== 0) {
                data.ap = data.ap.filter((aps) => {
                  return aps.name === 'CAS_Registry' || aps.name === 'FDA_UNII_Code' || aps.name === 'NSC_Code';
                });
              }
            });
            valueObj.n_syn = source.n_syn;
          }
          valueObj.i_c = {};
          valueObj.i_c.c = source.i_c ? highlightICObj[source.i_c.c] ? highlightICObj[source.i_c.c] : source.i_c.c : undefined;
          valueObj.i_c.id = source.i_c ? (obj.property + '-' + valueObj.src_n + '-' + source.i_c.c).replace(/[^a-zA-Z0-9-]+/gi, '') : undefined;
          if (source.ic_enum !== undefined) {
            valueObj.ic_enum = source.ic_enum;
            source.ic_enum.forEach(ic => {
              if (ic.term_type === '*') termTypeNotAssigned = true;
            });
          }
          obj.vs.push(valueObj);
        }
      });
      obj.vs = sortAlphabetically(obj.vs);
      valuesCount += obj.vs.length;
      values.push(obj);
    }
  });

  console.log(values);

  const TableSynonyms = (props) => {
    if (props.synonyms !== undefined) {
      return props.synonyms.map((item, index) =>
        <tr key={index}>
          <td>{item.termName}</td>
          <td>{item.termSource}</td>
          <td>{item.termGroup}</td>
        </tr>
      );
    }
    return (null);
  };

  const NcitValues = (props) => {
    if (props.ncit !== undefined) {
      return props.ncit.map((item, index) =>
        <div key={index} className="ncit-value-container">
          <Row>
            <TableCol xs={12}>
              <b>NCI Thesaurus Code: </b>
              <a href="#">{item.n_c}</a>
            </TableCol>
          </Row>
          <Row>
            <TableCol xs={12}>
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Source</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <TableSynonyms synonyms={item.s}/>
                </tbody>
              </Table>
            </TableCol>
          </Row>
        </div>
      );
    }
    return (null);
  };

  const TableValue = (props) => {
    let [isToggleOn, setIsToggleOn] = useState(false);

    const ToggleTableHandler = event => {
      event.preventDefault();
      setIsToggleOn(!isToggleOn);
    };

    console.log(props);

    return (
      <TableCol xs={12}>
        <Row>
          <Col xs={10}>
            <a href="#" dangerouslySetInnerHTML={{ __html: props.name }}></a>
          </Col>
          <ColRight xs={2}>
            {props.nsyn !== undefined &&
              <a href="#" onClick={ToggleTableHandler}>
                <Glyphicon glyph="plus" />
              </a>
            }
          </ColRight>
        </Row>
        {props.nsyn !== undefined &&
          <div className="ncit-values" style={isToggleOn === true ? { display: 'block' } : { display: 'none' }}>
            <NcitValues ncit={props.nsyn} />
          </div>
        }
      </TableCol>
    );
  };

  const valuesItems = values.map((item, index) =>
    <TableRowFlex key={index}>
      <TableCol xs={3}>
        {item.category}
        <ul>
          <li>{item.node}
            <ul>
              <li>{item.property}</li>
            </ul>
          </li>
        </ul>
      </TableCol>
      <TableValues xs={9}>
        {item.vs.map((value, index) =>
          <TableRowFlex key={index}><TableValue name={value.n} nsyn={value.n_syn}/></TableRowFlex>
        )}
      </TableValues>
    </TableRowFlex>
  );

  return (
    <Container>
      <TableThead>
        <Col xs={3}>
          <TableTh>Category / Node / Property</TableTh>
        </Col>
        <Col xs={9}>
          <TableTh>Matched GDC Values</TableTh>
        </Col>
      </TableThead>
      <TableBody>
        <Col xs={12}>{valuesItems}</Col>
      </TableBody>
    </Container>
  );
};

export default ValuesTable;
