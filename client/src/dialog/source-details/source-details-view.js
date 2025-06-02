export const headerTemplate = () => `
  <template-source-details-header>
  <div class="dialog__header">
    <div class="dialog__titlebar">
      <span id="ui-id-4" class="ui-dialog-title">Sources</span>
      <button type="button" id="close_source_details" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close"
        title="Close"></button>
    </div>
  </div>
  </template-source-details-header>
`;

export const bodyTemplate = () => `
  <template-source-details-body id="source_details">
  <div class="source__content">
    NCIt includes some data, notably terms, codes, and definitions, tagged as coming from the sources listed below. The extent
    and nature of this source data varies greatly:
    <ul>
      <li>Some sources, such as FDA and CDISC, are important partners in developing extensive tagged terminology subsets for
        regulatory and standards purposes;</li>
      <li>Several, such as CTCAE, DCP, DTP, and NCI-GLOSS, represent separate NCI terminology that has been cross-linked to
        NCIt concepts in whole or partially;</li>
      <li>Several outside sources, such as CRCH and JAX, have contributed terminology in particular fields; and</li>
      <li>Other sources are included in a variety of more limited ways to provide useful cross-links and information.</li>
    </ul>
    <table class="table table-striped">
      <thead>
        <th>Source</th>
        <th>Description</th>
      </thead>
      <tbody>
        <tr>
          <td>ACC</td>
          <td>American College of Cardiology</td>
        </tr>
        <tr>
          <td>BioCarta</td>
          <td>BioCarta online maps of molecular pathways, adapted for NCI use</td>
        </tr>
        <tr>
          <td>BRIDG</td>
          <td>Biomedical Research Integrated Domain Model Group</td>
        </tr>
        <tr>
          <td>CareLex</td>
          <td>CareLex electronic Trial Master File Terminology</td>
        </tr>
        <tr>
          <td>CDC</td>
          <td>U.S. Centers for Disease Control and Prevention</td>
        </tr>
        <tr>
          <td>CDISC</td>
          <td>Clinical Data Interchange Standards Consortium</td>
        </tr>
        <tr>
          <td>CDISC-GLOSS</td>
          <td>CDISC Glossary Terminology</td>
        </tr>
        <tr>
          <td>COH</td>
          <td>City of Hope</td>
        </tr>
        <tr>
          <td>CRCH</td>
          <td>Cancer Research Center of Hawaii Nutrition Terminology</td>
        </tr>
        <tr>
          <td>CTCAE</td>
          <td>Common Terminology Criteria for Adverse Events</td>
        </tr>
        <tr>
          <td>CTEP</td>
          <td>Cancer Therapy Evaluation Program</td>
        </tr>
        <tr>
          <td>CTRP</td>
          <td>Clinical Trials Reporting Program</td>
        </tr>
        <tr>
          <td>DCP</td>
          <td>NCI Division of Cancer Prevention Program</td>
        </tr>
        <tr>
          <td>DICOM</td>
          <td>Digital Imaging Communications in Medicine</td>
        </tr>
        <tr>
          <td>DTP</td>
          <td>NCI Developmental Therapeutics Program</td>
        </tr>
        <tr>
          <td>EDQM</td>
          <td>European Directorate for the Quality of Medicines & Healthcare</td>
        </tr>
        <tr>
          <td>FDA</td>
          <td>U.S. Food and Drug Administration</td>
        </tr>
        <tr>
          <td>GAIA</td>
          <td>Global Alignment of Immunization safety Assessment in pregnancy Terminology</td>
        </tr>
        <tr>
          <td>GENC</td>
          <td>Geopolitical Entities, Names, and Codes Terminology</td>
        </tr>
        <tr>
          <td>HGNC</td>
          <td>HUGO Gene Nomenclature Committee</td>
        </tr>
        <tr>
          <td>ICH</td>
          <td>International Conference on Harmonization</td>
        </tr>
        <tr>
          <td>IMDRF</td>
          <td>International Medical Device Regulators Forum</td>
        </tr>
        <tr>
          <td>JAX</td>
          <td>Jackson Laboratories Mouse Terminology, adapted for NCI use</td>
        </tr>
        <tr>
          <td>KEGG</td>
          <td>KEGG Pathway Database</td>
        </tr>
        <tr>
          <td>MedDRA</td>
          <td>Medical Dictionary for Regulatory Activities</td>
        </tr>
        <tr>
          <td>MMHCC</td>
          <td>Mouse Models of Human Cancer Consortium</td>
        </tr>
        <tr>
          <td>NCCN</td>
          <td>National Comprehensive Cancer Network</td>
        </tr>
        <tr>
          <td>NCI</td>
          <td>National Cancer Institute Thesaurus</td>
        </tr>
        <tr>
          <td>NCI-GLOSS</td>
          <td>NCI Dictionary of Cancer Terms</td>
        </tr>
        <tr>
          <td>NCI-HL7</td>
          <td>NCI Health Level 7</td>
        </tr>
        <tr>
          <td>NCPDP</td>
          <td>National Council for Prescription Drug Programs</td>
        </tr>
        <tr>
          <td>NICHD</td>
          <td>National Institute of Child Health and Human Development</td>
        </tr>
        <tr>
          <td>PID</td>
          <td>NCI Nature Pathway Interaction Database</td>
        </tr>
        <tr>
          <td>PI-RADS</td>
          <td>Prostate Imaging-Reporting and Data System</td>
        </tr>
        <tr>
          <td>RENI</td>
          <td>Registry Nomenclature Information System</td>
        </tr>
        <tr>
          <td>UCUM</td>
          <td>Unified Code for Units of Measure</td>
        </tr>
        <tr>
          <td>Zebrafish</td>
          <td>Zebrafish Model Organism Database</td>
        </tr>
      </tbody>
    </table>
  </div>
  </template-source-details-body>
`;
