import { tableSynonyms, tableAdditionalProperties } from '../../components/table';

export const headerTemplate = `
  <template-ncit-details-header>
  <div class="dialog__header">
    <div class="dialog__titlebar">
      <span id="ui-id-4" class="ui-dialog-title">NCIt Terms & Properties</span>
      <button type="button" id="close_ncit_details" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>
    </div>
  </div>
  </template-ncit-details-header>
`;

export const bodyTemplate = (item) => `
  <template-ncit-details-body id="ncit_details">
    <div class="ncit__content">
      <p><b>Preferred Name: </b>${item.name}</p>
      ${item.definition !== undefined ? `
        <p><b>Definition: </b>${item.definition}</p>
      ` : ``}
      <p><b>NCI Thesaurus Code: </b>
        <a href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code=${item.code}" target="_blank">${item.code}</a>
      </p>
      ${item.s.length !== 0 ? `
        <p><b>Synonyms &amp; Abbreviations:</b></p>
        ${tableSynonyms(item)}
      ` : ``}
      ${item.ap !== undefined && item.ap.length !== 0 ? `
        <p><b>Additional Attributes:</b></p>
        ${tableAdditionalProperties(item)}
      ` : ``}  
      <p>
        <a href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code=${item.code}" target="_blank">more details</a>
      </p>
    </div>
  </template-ncit-details-body>
`;
