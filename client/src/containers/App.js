import React from 'react';
import styled from 'styled-components';
import styles from './App.css';
console.log(styles);

// const Title = styled.h1`
//   color: #0d1a26;
//   font-weight: 400;
// `;

import { H1, Button} from '@bootstrap-styled/v4';

const StyledButton = styled(Button)`
  && {
    color: palevioletred;
    background-color: #fff;
    font-size: 1em;
    margin: 1em;
    padding: 0.25em 1em;
    border: 2px solid palevioletred;
    border-radius: 3px;
  }
  &&:hover {
    color: red;
    background-color: #000;
  }
`;

console.log(StyledButton);

function App() {
  return (
    <div >
      <header>
        <H1>
          Bootstrap Works!!!
        </H1>
        <StyledButton>StyledButton</StyledButton>
      </header>
    </div>
  );
}

export default App;
