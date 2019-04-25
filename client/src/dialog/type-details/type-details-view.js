export const header_template = () => `
  <div class="dialog__header">
    <div class="dialog__titlebar">
      <span id="ui-id-4" class="ui-dialog-title">Term Types</span>
      <button type="button" id="close_type_details" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"
        title="Close"></button>
    </div>
  </div>
`
export const body_template = () => `
<div id="type_details">
  <div class="type__content">
    <p>
      NCI Thesaurus Term Types use 2- or 3-character abbreviations to code the nature of each term associated with a concept. Here
      is a listing of the term type codes and their meanings:
    </p>
    <table class="table table-striped">
      <thead>
        <th>Name</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr>
          <td>AB</td>
          <td>Abbreviation</td>
        </tr>
        <tr>
          <td>AD</td>
          <td>Adjectival form (and other parts of grammer)</td>
        </tr>
        <tr>
          <td>AQ*</td>
          <td>Antiquated preferred term</td>
        </tr>
        <tr>
          <td>AQS</td>
          <td>Antiquated term, use when there are antiquated synonyms within a concept</td>
        </tr>
        <tr>
          <td>BR</td>
          <td>US brand name, which may be trademarked</td>
        </tr>
        <tr>
          <td>CA2</td>
          <td>ISO 3166 alpha-2 country code</td>
        </tr>
        <tr>
          <td>CA3</td>
          <td>ISO 3166 alpha-3 country code</td>
        </tr>
        <tr>
          <td>CNU</td>
          <td>ISO 3166 numeric country code</td>
        </tr>
        <tr>
          <td>CI</td>
          <td>ISO Country code (deprecated)</td>
        </tr>
        <tr>
          <td>CN</td>
          <td>Drug study code</td>
        </tr>
        <tr>
          <td>CS</td>
          <td>US State Department country code</td>
        </tr>
        <tr>
          <td>DN</td>
          <td>Display name</td>
        </tr>
        <tr>
          <td>FB</td>
          <td>Foreign brand name, which may be trademarked</td>
        </tr>
        <tr>
          <td>LLT</td>
          <td>Lower Level Term</td>
        </tr>
        <tr>
          <td>HD*</td>
          <td>Header (groups concepts, but not used for coding data)</td>
        </tr>
        <tr>
          <td>PT*</td>
          <td>Preferred term</td>
        </tr>
        <tr>
          <td>SN</td>
          <td>Chemical structure name</td>
        </tr>
        <tr>
          <td>SY</td>
          <td>Synonym</td>
        </tr>
      </tbody>
    </table>
    <p>*Note on special rules governing NCI PT, HD, and AQ term types: Each concept should have one, and only one, term coded
      with one of these three values. The NCI Preferred Term is always taken from one of the NCI terms, normally that with
      a type of PT (Preferred Term). However, in special cases, a concept will not have a PT term, but instead, will have
      either an HD (Header) term or an AQ term. These tags are considered equivalent to PT by the software. This means
      that a concept may have only as single NCI PT, or HD, or AQ term. In those cases where multiple antiquated terms
      are needed for a concept which is itself coded as antiquated, one should be tagged AQ and the rest tagged AQS.
    </p>
  </div>
</div>
`
