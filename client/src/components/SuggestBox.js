import React, { useState } from 'react';
import styled from 'styled-components';

const Suggest = styled.div`
  position: relative;
`;

const SuggestContent = styled.div`
  width: calc(100% - 11.5em);
  display: none;
  border-radius: 5px;
  padding-top: .5em;
  padding-bottom: .5em;
  background-color: #fff;
  box-shadow: 0 2px 3px 3px rgba(0,0,0,.16), 0 0 0 1px rgba(0,0,0,.08);
  position: absolute;
  top: 2px;
  left: 3px;
  z-index: 100;
`;

const SuggestObject = styled.div`
  line-height: 1.8em;
  font-size: 1em;
  display: flex;
  justify-content: space-between;
`;

const SuggestName = styled.div`
  margin: 0 .9em;
`;

const SuggestType = styled.div`
  font-weight: 700;
  margin-right: .9em;
`;

const SuggestBox = (props) => {
  const suggestItems = props.suggest.map((item, index) =>
    <SuggestObject key={item.id}>
      <SuggestName>{item.id}</SuggestName>
      <SuggestType>{item.type}</SuggestType>
    </SuggestObject>
  );

  return (
    <Suggest>
      <SuggestContent style={props.suggest.length === 0 ? {} : { display: 'block' }}>
        { suggestItems }
      </SuggestContent>
    </Suggest>
  );
};

export default SuggestBox;
