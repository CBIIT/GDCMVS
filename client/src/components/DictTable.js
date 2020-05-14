import React, { useState } from 'react';
import styled from 'styled-components';
import { getHighlightObj, getAllValueHighlight } from '../shared';
import { Grid, Row, Col, Glyphicon } from 'react-bootstrap';

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
  text-align: left;
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: 1.428571;
`;

const TableCol = styled(Col)`
  display: inline-block;
`;

const Ul = styled.ul`
  list-style: none;
  padding: 0;
`;

const GlyphiconStyled = styled(Glyphicon)`
  font-size: 10px;
`;

const Categories = styled.li`
  & .treeindenter {
    position: relative;
    padding-left: 25px;
  }

  & .treetoggle {
    padding-left: 8px;
    padding-right: 8px;
    position: absolute;
    right: 0;
  }
`;

const Nodes = styled.li`
  & .treeindenter {
    padding-left: 40px;
  }
`;

const Properties = styled.li`
  & .treeindenter {
    padding-left: 55px;
  }
`;

const Values = styled.li`
  & .treeindenter {
    padding-left: 85px;
  }
`;

const DictTable = (props) => {
  let data = JSON.parse(JSON.stringify(props.dictionary));

  let dictionary = [];
  // final result
  let mainObj = {};
  data.forEach(item => {
    let source = item._source;
    let enumHits = item.inner_hits.enum.hits;
    let highlight = item.highlight ? item.highlight : undefined;

    if (mainObj[source.category] === undefined) { // category doesn't exists, add it
      let categoryObj = {
        category: source.category,
        type: 'category',
        length: 0,
        nodes_obj: {},
        nodes: []
      };

      let nodeObj = {
        node: source.node,
        node_desc: source.node_desc,
        type: 'node',
        length: 0,
        properties_obj: {},
        properties: []
      };

      let propertyObj = {
        type: 'property',
        length: 0,
        hl_values: [],
        all_values: []
      };

      let highlightCdeId;
      // Add highlight to property
      if (highlight !== undefined) {
        let highlightProp = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
        let highlightPropObj = getHighlightObj(highlightProp);

        highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;

        let highlightPropDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
        let highlightPropDescObj = {};
        if (highlightPropDesc !== undefined) {
          highlightPropDesc.forEach(val => {
            if (highlightPropDescObj[source.property] === undefined) highlightPropDescObj[source.property] = val;
          });
        }
        propertyObj.property = highlightPropObj[source.property] ? highlightPropObj[source.property] : source.property;
        propertyObj.property_desc = highlightPropDescObj[source.property] ? highlightPropDescObj[source.property] : source.property_desc;
        propertyObj.length += highlightPropDesc !== undefined || highlightProp !== undefined || highlightCdeId !== undefined ? 1 : 0;
      } else {
        propertyObj.property = source.property;
        propertyObj.property_desc = source.property_desc;
      }
      let highlightValueObj = {};
      if (enumHits.total !== 0) highlightValueObj = getAllValueHighlight(enumHits);
      propertyObj.all_values = source.enum !== undefined ? source.enum.map(function(x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
      propertyObj.all_values.sort();

      if (enumHits.total !== 0 && highlightCdeId === undefined) {
        enumHits.hits.forEach(emHit => {
          let emSource = emHit._source;
          let emHighlight = emHit.highlight;
          let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
          let highlightValueObj = getHighlightObj(highlightValue);
          let valueObj = highlightValueObj[emSource.n] ? highlightValueObj[emSource.n] : emSource.n;
          if (propertyObj.hl_values.indexOf(valueObj) === -1) propertyObj.hl_values.push(valueObj);
          propertyObj.hl_values.sort();
        });
      } else if (enumHits.total !== 0 && highlightCdeId !== undefined) {
        let highlightValueObj = getAllValueHighlight(enumHits);
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function(x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
        propertyObj.hl_values.sort();
      } else if (enumHits.total === 0 && highlightCdeId !== undefined) {
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function(x) { return x.n; }) : [];
        propertyObj.hl_values.sort();
      }
      propertyObj.length += propertyObj.hl_values.length;
      if (nodeObj.properties_obj[source.property] === undefined) {
        nodeObj.properties_obj[source.property] = {};
        nodeObj.properties_obj[source.property] = propertyObj;
        nodeObj.length += propertyObj.length;
      }

      if (categoryObj.nodes_obj[source.node] === undefined) {
        categoryObj.nodes_obj[source.node] = {};
        categoryObj.nodes_obj[source.node] = nodeObj;
      }

      mainObj[source.category] = categoryObj;
    } else { // category already exists
      let nodeObj = {
        node: source.node,
        node_desc: source.node_desc,
        type: 'node',
        length: 0,
        properties_obj: {},
        properties: []
      };

      let propertyObj = {
        type: 'property',
        length: 0,
        hl_values: [],
        all_values: []
      };

      let highlightCdeId;
      // Add highlight to property
      if (highlight !== undefined) {
        let highlightProp = ('property' in highlight) || ('property.have' in highlight) ? highlight['property'] || highlight['property.have'] : undefined;
        let highlightPropObj = getHighlightObj(highlightProp);

        highlightCdeId = ('cde.id' in highlight) ? highlight['cde.id'] : undefined;

        let highlightPropDesc = ('property_desc' in highlight) ? highlight['property_desc'] : undefined;
        let highlightPropDescObj = {};
        if (highlightPropDesc !== undefined) {
          highlightPropDesc.forEach(val => {
            if (highlightPropDescObj[source.property] === undefined) highlightPropDescObj[source.property] = val;
          });
        }
        propertyObj.property = highlightPropObj[source.property] ? highlightPropObj[source.property] : source.property;
        propertyObj.property_desc = highlightPropDescObj[source.property] ? highlightPropDescObj[source.property] : source.property_desc;
        propertyObj.length += highlightPropDesc !== undefined || highlightProp !== undefined || highlightCdeId !== undefined ? 1 : 0;
      } else {
        propertyObj.property = source.property;
        propertyObj.property_desc = source.property_desc;
      }
      let highlightValueObj = {};
      if (enumHits.total !== 0) highlightValueObj = getAllValueHighlight(enumHits);
      propertyObj.all_values = source.enum !== undefined ? source.enum.map(function(x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
      propertyObj.all_values.sort();

      if (enumHits.total !== 0 && highlightCdeId === undefined) {
        enumHits.hits.forEach(emHit => {
          let emSource = emHit._source;
          let emHighlight = emHit.highlight;
          let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
          let highlightValueObj = getHighlightObj(highlightValue);
          let valueObj = highlightValueObj[emSource.n] ? highlightValueObj[emSource.n] : emSource.n;
          if (propertyObj.hl_values.indexOf(valueObj) === -1) propertyObj.hl_values.push(valueObj);
          propertyObj.hl_values.sort();
        });
      } else if (enumHits.total !== 0 && highlightCdeId !== undefined) {
        let highlightValueObj = getAllValueHighlight(enumHits);
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function(x) { return highlightValueObj[x.n] ? highlightValueObj[x.n] : x.n; }) : [];
        propertyObj.hl_values.sort();
      } else if (enumHits.total === 0 && highlightCdeId !== undefined) {
        propertyObj.hl_values = source.enum !== undefined ? source.enum.map(function(x) { return x.n; }) : [];
        propertyObj.hl_values.sort();
      }
      propertyObj.length += propertyObj.hl_values.length;
      if (mainObj[source.category].nodes_obj[source.node] !== undefined) { // If node already exists add new properties_obj to it.
        if (mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] === undefined) {
          mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] = {};
          mainObj[source.category].nodes_obj[source.node].properties_obj[source.property] = propertyObj;
          mainObj[source.category].nodes_obj[source.node].length += propertyObj.length;
        }
      } else { // If node doesn't exists add new node and properties_obj.
        if (nodeObj.properties_obj[source.property] === undefined) {
          nodeObj.properties_obj[source.property] = {};
          nodeObj.properties_obj[source.property] = propertyObj;
          nodeObj.length += propertyObj.length;
        }
        mainObj[source.category].nodes_obj[source.node] = {};
        mainObj[source.category].nodes_obj[source.node] = nodeObj;
      }
    };
  });
  for (let category in mainObj) {
    let categoryObj = mainObj[category];
    for (let node in categoryObj.nodes_obj) {
      let nodeObj = categoryObj.nodes_obj[node];
      for (let property in nodeObj.properties_obj) {
        let propertyObj = nodeObj.properties_obj[property];
        nodeObj.properties.push(propertyObj);
      }
      delete nodeObj.properties_obj;
      categoryObj.nodes.push(nodeObj);
      categoryObj.length += nodeObj.length;
    }
    delete categoryObj.nodes_obj;
    dictionary.push(categoryObj);
  }

  console.log(dictionary);

  const HighlightValues = (props) => {
    if (props.hlvalues !== undefined || props.hlvalues.length !== 0) {
      return props.hlvalues.map((item, index) =>
        <Values key={index}>
          <TableRow>
            <TableCol className="treeindenter" xs={4} dangerouslySetInnerHTML={{ __html: item }}></TableCol>
            <TableCol xs={8}></TableCol>
          </TableRow>
        </Values>
      );
    }
    return (null);
  };

  // const AllValues = (props) => {
  //   if (props.allvalues !== undefined || props.allvalues.length !== 0) {
  //     return props.allvalues.map((item, index) =>
  //       <Values key={index}>
  //         <TableRow>
  //           <TableCol className="treeindenter" xs={4} dangerouslySetInnerHTML={{ __html: item }}></TableCol>
  //           <TableCol xs={8}></TableCol>
  //         </TableRow>
  //       </Values>
  //     );
  //   }
  //   return (null);
  // };

  const PropertiesTable = (props) => {
    let [isToggleOn, setIsToggleOn] = useState(false);

    const ToggleTableHandler = event => {
      event.preventDefault();
      setIsToggleOn(!isToggleOn);
    };

    if (props.properties !== undefined || props.properties.length !== 0) {
      return props.properties.map((item, index) =>
        <Properties key={index}>
          <TableRow>
            <TableCol xs={4}>
              <span className="treeindenter">
                <a className="treetoggle" href="#" onClick={ToggleTableHandler}>
                  <GlyphiconStyled glyph={isToggleOn === true ? 'menu-up' : 'menu-down'} />
                </a>
              </span>
              <a href="#">{item.property} ({item.length})</a>
            </TableCol>
            <TableCol xs={8}>{item.property_desc}</TableCol>
          </TableRow>
          <Ul style={isToggleOn === true ? { display: 'block' } : { display: 'none' }}>
            <HighlightValues hlvalues={item.hl_values}/>
          </Ul>
          {/* <Ul><AllValues allvalues={item.all_values}/></Ul> */}
        </Properties>
      );
    }
    return (null);
  };

  const NodesTable = (props) => {
    let [isToggleOn, setIsToggleOn] = useState(false);

    const ToggleTableHandler = event => {
      event.preventDefault();
      setIsToggleOn(!isToggleOn);
    };

    if (props.nodes !== undefined || props.nodes.length !== 0) {
      return props.nodes.map((item, index) =>
        <Nodes key={index}>
          <TableRow>
            <TableCol xs={4}>
              <span className="treeindenter">
                <a className="treetoggle" href="#" onClick={ToggleTableHandler}>
                  <GlyphiconStyled glyph={isToggleOn === true ? 'menu-up' : 'menu-down'} />
                </a>
              </span>
              <a href="#">{item.node} ({item.length})</a>
            </TableCol>
            <TableCol xs={8}>{item.node_desc}</TableCol>
          </TableRow>
          <Ul style={isToggleOn === true ? { display: 'block' } : { display: 'none' }}>
            <PropertiesTable properties={item.properties} />
          </Ul>
        </Nodes>
      );
    }
    return (null);
  };

  const CategoriesTable = (props) => {
    let [isToggleOn, setIsToggleOn] = useState(false);

    const ToggleTableHandler = event => {
      event.preventDefault();
      setIsToggleOn(!isToggleOn);
    };

    if (props.categories !== undefined || props.categories.length !== 0) {
      return props.categories.map((item, index) =>
        <Categories key={index}>
          <TableRow>
            <TableCol xs={4}>
              <span className="treeindenter">
                <a className="treetoggle" href="#" onClick={ToggleTableHandler}>
                  <GlyphiconStyled glyph={isToggleOn === true ? 'menu-up' : 'menu-down'} />
                </a>
              </span>
              <a href="#">{item.category} ({item.length})</a>
            </TableCol>
            <TableCol xs={8}></TableCol>
          </TableRow>
          <Ul style={isToggleOn === true ? { display: 'block' } : { display: 'none' }}>
            <NodesTable nodes={item.nodes}/>
          </Ul>
        </Categories>
      );
    }
    return (null);
  };

  return (
    <Container>
      <TableThead>
        <Col xs={3}>
          <TableTh>Name</TableTh>
        </Col>
        <Col xs={9}>
          <TableTh>Description</TableTh>
        </Col>
      </TableThead>
      <TableBody>
        <Col xs={12}>
          <Ul className="treeview">
            <CategoriesTable categories={dictionary} />
          </Ul>
        </Col>
      </TableBody>
    </Container>
  );
};

export default DictTable;
