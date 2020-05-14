import React,  { useState } from 'react';
import ReactDOM from 'react-dom';

const GDCTerms = () => {
  const openDialog = event => {
    event.preventDefault();
    let $dialog = $('<div>').dialog({
      title: 'Example Dialog Title',
      width: 400,
      close: function(e) {
        ReactDOM.unmountComponentAtNode(this);
        $(this).remove();
      }
    });

    const closeDialog = event => {
      event.preventDefault();
      $dialog.dialog('close');
    };

    const DialogContent = () => {
      return (
        <div>
          <button onClick = {closeDialog}>Cancel</button>
        </div>
      );
    };

    ReactDOM.render(<DialogContent closeDialog={closeDialog} />, $dialog[0]);

    $($dialog[0]).parent().draggable({ containment: '#docs-container' });
  };

  return (
    <button onClick={openDialog}>Open Dialog</button>
  );
};

export default GDCTerms;
