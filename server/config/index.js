const path = require('path');
const _ = require('lodash');

if (process.env.NODE_ENV !== 'prod') {
  require('dotenv').config();
};

const all = {
  // Root path of server
  root: path.resolve(__dirname, '../../'),

  // Server port
  port: process.env.PORT || 5000,

  // Server port
  logDir: process.env.LOGDIR || '/local/content/mvs/logs',

  // Node environment (dev, test, stage, prod), must select one.
  env: process.env.NODE_ENV || 'prod',

  // general gdc index name
  indexName: 'gdc',

  // suggestion index name for typeahead
  suggestionName: 'gdc-suggestion',

  // NCIT details index name;
  ncitDetails: 'ncit-details',

  // index name for properties
  index_p: 'gdc-p',

  // index name for values
  index_v: 'gdc-v',

  // GDC drugs properties
  drugs_properties: ['therapeutic_agents'],

  // get data from caDSR
  caDSR_url: [
    'https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/search?publicId=',
    'https://cdebrowser.nci.nih.gov/cdebrowserServer/rest/CDEData?deIdseq='
  ],

  // get synonyms from NCIt
  NCIt_url: [
    'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code=',
    'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&type=synonym&code=',
    'http://nciws-d790.nci.nih.gov:15080/evsrestapi2/api/v1/ctrp/concept/',
    'https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=CTCAE&type=synonym&code=',
    'https://evsrestapi.nci.nih.gov/evsrestapi/api/v1/ctrp/concept/',
    'https://evsrestapi-stage.nci.nih.gov/evsrestapi/api/v1/conceptList?db=weekly&properties=Code,Preferred_Name,FULL_SYN,DEFINITION&concepts=',
    'https://api-evsrest.nci.nih.gov/api/v1/concept/ncit/'
  ],

  // GDC searchable nodes
  searchable_nodes: [
    'aggregated_somatic_mutation',
    'aligned_reads_index',
    'aligned_reads',
    'alignment_cocleaning_workflow',
    'alignment_workflow',
    'aliquot',
    'analysis_metadata',
    'analyte',
    'annotated_somatic_mutation',
    'archive',
    'biospecimen_supplement',
    'case',
    'center',
    'clinical_supplement',
    'clinical',
    'copy_number_auxiliary_file',
    'copy_number_estimate',
    'copy_number_liftover_workflow',
    'copy_number_segment',
    'copy_number_variation_workflow',
    'data_release',
    'demographic',
    'diagnosis',
    'experiment_metadata',
    'exposure',
    'expression_analysis_workflow',
    'family_history',
    'filtered_copy_number_segment',
    'follow_up',
    'gene_expression',
    'genomic_profile_harmonization_workflow',
    'germline_mutation_calling_workflow',
    'germline_mutation_index',
    'masked_methylation_array',
    'masked_somatic_mutation',
    'methylation_array_harmonization_workflow',
    'methylation_beta_value',
    'methylation_liftover_workflow',
    'mirna_expression_workflow',
    'mirna_expression',
    'molecular_test',
    'other_clinical_attribute',
    'pathology_detail',
    'pathology_report',
    'portion',
    'program',
    'project',
    'protein_expression',
    'raw_methylation_array',
    'read_group_qc',
    'read_group',
    'rna_expression_workflow',
    'root',
    'run_metadata',
    'sample',
    'secondary_expression_analysis',
    'simple_germline_variation',
    'simple_somatic_mutation',
    'slide_image',
    'slide',
    'somatic_aggregation_workflow',
    'somatic_annotation_workflow',
    'somatic_copy_number_workflow',
    'somatic_mutation_calling_workflow',
    'somatic_mutation_index',
    'structural_variant_calling_workflow',
    'structural_variation',
    'submitted_aligned_reads',
    'submitted_expression_array',
    'submitted_genomic_profile',
    'submitted_genotyping_array',
    'submitted_methylation_beta_value',
    'submitted_tangent_copy_number',
    'submitted_unaligned_reads',
    'tag',
    'tissue_source_site',
    'treatment'
  ]

};

module.exports = _.merge(all, require('./' + all.env + '.js'));
