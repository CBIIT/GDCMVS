let tmpl = {
  header: '<div class="dialog__header">'
    +'<div class="dialog__titlebar">'
      +'<span id="ui-id-4" class="ui-dialog-title">NCIt Terms & Properties</span>'
      +'<button type="button" id="close_ncit_details" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>'
    +'</div>'
  +'</div>',
  body: '<div id="ncit_details"><div class="ncit__content">'
    +'<p><b>Preferred Name:</b> {{:item.name}}</p>'
    +'{{if item.definition !== undefined}}'
      +'<p><b>Definition:</b> {{:item.definition}}</p>'
    +'{{/if}}'
    +'<p><b>NCI Thesaurus Code:</b>'
      +'<a href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:item.code}}" target="_blank"">{{:item.code}}</a>'
    +'</p>'
    +'{{if item.synonyms.length }}'
      +'<p><b>Synonyms &amp; Abbreviations:</b></p>'
      +'<p>{{for item.synonyms}}{{:}}</br>{{/for}}</p>'
    +'{{/if}}'
    +'<p><a href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:item.code }}" target="_blank"">more details</p>'
    +'</div>'
  +'</div>'
}

export default tmpl;