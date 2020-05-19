import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { apiGetGDCDataById } from '../../api';
import { getAllSyn } from '../../shared';

const GDCTerms = (props) => {
  const DialogHeader = () => {
    return (
      <div>
        <p>Header</p>
      </div>
    );
  };

  const openDialog = event => {
    event.preventDefault();

    apiGetGDCDataById(props.idterm).then(result => {
      let items = [];
      let icdo = false;
      if (result[0]._source.enum !== undefined) {
        result[0]._source.enum.forEach(value => {
          if (icdo === true) return;
          if (value.i_c !== undefined) {
            icdo = true;
          }
        });
        items = getAllSyn(result[0]._source.enum);
      }

      let $dialog = $('<div>').dialog({
        title: 'Example Dialog Title',
        width: 400,
        open: function() {
          // $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.8em');

          // console.log($(this).prev('.ui-dialog-titlebar')[0]);
          ReactDOM.render(<DialogHeader />, $(this).prev('.ui-dialog-titlebar')[0]);
        },
        close: function() {
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
            <p>GDC Terms</p>
            <pre>{JSON.stringify(items)}</pre>
            <button onClick={closeDialog}>Cancel</button>
          </div>
        );
      };

      ReactDOM.render(<DialogContent closeDialog={closeDialog} />, $dialog[0]);

      $($dialog[0]).parent().draggable({ containment: '#docs-container' });
    });
  };

  return (
    <a href="#" onClick={openDialog}>See All Values</a>
  );
};

export default GDCTerms;
