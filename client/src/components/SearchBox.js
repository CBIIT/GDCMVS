import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiSuggest } from '../api';
import { InputGroup, FormControl, FormGroup, Button, Checkbox } from 'react-bootstrap';
import SuggestBox from './SuggestBox';
// import GDCValues from './dialogs/GDCValues';

const SearchBar = styled.div`
  width: 60%;
  min-width: 690px;
  margin: 0 auto;
`;

const SearchOptions = styled.div`
  width: 60%;
  min-width: 690px;
  margin: 0 auto;
  padding: 1.5em 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ecf0f1;
`;

const SearchButton = styled(Button)`
  background-color: #6a7676;
  border-color: #6a7676;
  padding: 8px 45px;
  font-size: 17px;
  color: #fff;
`;

const SearchBox = (props) => {
  let [suggestState, setSuggestState] = useState([]);
  let [searchState, setSearchState] = useState('');
  let [selectIndexState, setSelectIndexState] = useState(-1);
  // let [sourceState, setSourceState] = useState([]);

  // const ref = useRef(null);

  const suggestClickHandler = (id, event) => {
    setSearchState(id);
    setSuggestState([]);
    props.searchTrigger(id);
  };

  const suggestKeyPressHandler = event => {
    if (event.keyCode === 13 && suggestState.length !== 0) {
      setSearchState(suggestState[selectIndexState].id);
      setSuggestState([]);
      props.searchTrigger(suggestState[selectIndexState].id);
    }
    if (event.keyCode === 38 || event.keyCode === 40) {
      let index = selectIndexState;
      index += event.keyCode === 40 ? 1 : -1;
      if (index >= suggestState.length) {
        index = 0;
      }
      if (index < 0) {
        index = suggestState.length - 1;
      }
      setSelectIndexState(index);
    }
  };

  const cleanSuggestHandler = () => {
    setSuggestState([]);
    setSelectIndexState(-1);
  };

  // useEffect(() => {
  //   document.body.addEventListener('click', clickHandler);
  //   return () => document.body.removeEventListener('click', clickHandler);
  // }, []);

  // const measuredRef = useCallback(node => {
  //   if (node !== null) {
  //     console.log(node);
  //   }
  // }, []);

  // const useOutsideClick = (ref, callback) => {
  //   const handleClick = e => {
  //     if (ref.current && !ref.current.contains(e.target)) {
  //       callback();
  //     }
  //   };
  //   useEffect(() => {
  //     document.addEventListener('click', handleClick);
  //     return () => {
  //       document.removeEventListener('click', handleClick);
  //     };
  //   });
  // };

  // useOutsideClick(ref, () => {
  //   alert('You clicked outside');
  // });

  const suggestHandler = event => {
    setSearchState(event.target.value);
    apiSuggest(event.target.value).then(result => setSuggestState(result));
  };

  return (
    <div>
      <SearchBar>
        <InputGroup>
          <FormControl type="text" value={searchState} onChange={suggestHandler} onKeyDown={suggestKeyPressHandler}/>
          <InputGroup.Button>
            <SearchButton onClick={() => props.searchTrigger(searchState)}>Search</SearchButton>
          </InputGroup.Button>
        </InputGroup>
        <SuggestBox
          suggest={suggestState}
          suggestClick={suggestClickHandler}
          suggestSelected={selectIndexState}
          cleanSuggest={cleanSuggestHandler}
        />
      </SearchBar>
      <SearchOptions>
        <FormGroup>
          <Checkbox inline>Exact match</Checkbox>
          <Checkbox inline>Property description</Checkbox>
          <Checkbox inline>Synonyms</Checkbox>
          <a href="https://ncit.nci.nih.gov/" target="_blank" rel="noreferrer">Search in NCIt</a>
          <a href="https://ncit.nci.nih.gov/" target="_blank" rel="noreferrer">Search in NCIt</a>
        </FormGroup>
      </SearchOptions>
    </div>
  );
};

export default SearchBox;
