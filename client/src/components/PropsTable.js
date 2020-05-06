import React, { useState } from 'react';
// import styled from 'styled-components';
import { getHighlightObj } from '../shared';

const PropsTable = (props) => {
  let data = JSON.parse(JSON.stringify(props.properties));

  const properties = data.map((item) => {
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
    return propObj;
  });

  const PropsItems = properties.map((item, index) =>
    <div key={index}>
      <pre>{JSON.stringify(item)}</pre>
    </div>
  );

  return (
    <div>{PropsItems}</div>
  );
};

export default PropsTable;
