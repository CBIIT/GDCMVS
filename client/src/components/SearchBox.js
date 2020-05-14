import React, { useState } from 'react';
import styled from 'styled-components';
import { apiSuggest } from '../api';
import { InputGroup, FormControl, FormGroup, Button, Checkbox } from 'react-bootstrap';
import SuggestBox from './SuggestBox';
import GDCTerms from './dialogs/GDCTerms';

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
  // let [sourceState, setSourceState] = useState([]);

  const suggestHandler = event => {
    setSearchState(event.target.value);
    apiSuggest(event.target.value).then(result => setSuggestState(result));
  };

  return (
    <div>
      <SearchBar>
        <InputGroup>
          <FormControl type="text" onChange={suggestHandler}/>
          <InputGroup.Button>
            <SearchButton onClick={() => props.search(searchState)}>Search</SearchButton>
          </InputGroup.Button>
        </InputGroup>
        <SuggestBox suggest={suggestState} />
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
      <GDCTerms />
    </div>
  );
};

export default SearchBox;
