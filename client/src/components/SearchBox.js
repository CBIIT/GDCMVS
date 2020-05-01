import React, { useState } from 'react';
import styled from 'styled-components';
import { apiSuggest } from '../api';
import { InputGroup, FormControl, FormGroup,Button, Checkbox} from 'react-bootstrap';
import SuggestBox from './SuggestBox';

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

const SearchBox = () => {
  let [suggestState, setSuggestState] = useState([]);

  const suggestHandler = (e) => {
    apiSuggest(e.target.value).then(result => setSuggestState(result));
  };

  return (
    <div>
      <SearchBar>
        <InputGroup>
          <FormControl type="text" onChange={suggestHandler}/>
          <InputGroup.Button>
            <Button>Search</Button>
          </InputGroup.Button>
        </InputGroup>
        <SuggestBox suggest={suggestState} />
      </SearchBar>
      <SearchOptions>
        <FormGroup>
          <Checkbox inline>Exact match</Checkbox>
          <Checkbox inline>Property description</Checkbox>
          <Checkbox inline>Synonyms</Checkbox>
          <a href="https://ncit.nci.nih.gov/" target="_blank">Search in NCIt</a>
          <a href="https://ncit.nci.nih.gov/" target="_blank">Search in NCIt</a>
        </FormGroup>
      </SearchOptions>
    </div>
  );
};

export default SearchBox;
