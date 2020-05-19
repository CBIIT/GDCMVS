import React, { useEffect, useRef } from 'react';
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

  &:hover {
    background-color: #f0f0f0;
  }

  &.selected {
    background-color: #f0f0f0;
  }
`;

const SuggestName = styled.div`
  margin: 0 .9em;
`;

const SuggestType = styled.div`
  font-weight: 700;
  margin-right: .9em;
`;

const SuggestBox = (props) => {
  const node = useRef();

  useEffect(() => {
    const clickHandler = event => {
      // click inside component
      if (node.current.contains(event.target)) return;
      // click ooutside component
      props.cleanSuggest();
    };

    document.body.addEventListener('click', clickHandler);
    return () => document.body.removeEventListener('click', clickHandler);
  }, [props]);

  const suggestItems = props.suggest.map((item, index) =>
    <SuggestObject
      key={item.id}
      onClick={e => props.suggestClick(item.id, e)}
      className={index === props.suggestSelected ? 'selected' : ''}>
      <SuggestName>{item.id}</SuggestName>
      <SuggestType>{item.type}</SuggestType>
    </SuggestObject>
  );

  return (
    <Suggest>
      <SuggestContent ref={node} style={props.suggest.length === 0 ? {} : { display: 'block' }}>
        {suggestItems}
      </SuggestContent>
    </Suggest>
  );
};

export default SuggestBox;
