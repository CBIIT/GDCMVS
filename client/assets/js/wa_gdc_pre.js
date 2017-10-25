/*
* Set Web Analytics variables for for GDC sites
*/
var wa_production_report_suite = 'nciccg-cancergenomics';
var wa_dev_report_suite = 'nciccg-cancergenomics-dev';
var wa_channel = '';
var wa_search_function_name = '';
var wa_production_url_match = '';
var wa_linkInternalFilters = 'javascript:,';
var currentHostname = location.hostname.toLowerCase();
wa_linkInternalFilters += currentHostname;
var page_URL = document.URL;

// Set channel, search name, and prod URL 
if (page_URL.indexOf('gdc.cancer.gov') != -1) {	
    wa_channel = 'Genomics Data Commons - Main';
    wa_search_function_name = 'Genomics Data Commons - Main - Search';
    wa_production_url_match = 'gdc.cancer.gov';
}
else if (page_URL.indexOf('gdc-api.nci.nih.gov') != -1) {	
    wa_channel = 'Genomics Data Commons - API';
    wa_production_url_match = 'gdc-api.nci.nih.gov';
}
else if (page_URL.indexOf('gdc-portal.nci.nih.gov') != -1) {	
    wa_channel = 'Genomics Data Commons - Data Portal';
    wa_search_function_name = 'Genomics Data Commons - Data Portal - Search';
    wa_production_url_match = 'gdc-portal.nci.nih.gov';
}
else if (page_URL.indexOf('gdc-docs.nci.nih.gov') != -1) {	
    wa_channel = 'Genomics Data Commons - Documentation';
    wa_search_function_name = 'Genomics Data Commons - Documentation - Search';
    wa_production_url_match = 'gdc-docs.nci.nih.gov';
}
else if (page_URL.indexOf('cbioportal.gdc.cancer.gov') != -1) {	
    wa_channel = 'Genomics Data Commons - cBio Portal';
    wa_search_function_name = 'Genomics Data Commons - cBio Portal - Search';
    wa_production_url_match = 'cbioportal.gdc.cancer.gov';
}
else {	
    wa_channel = 'GDC dev';
    wa_search_function_name = 'GDC search dev';
}

// Set Prod or Dev suite depending on URL
if (page_URL.indexOf(wa_production_url_match) != -1 && wa_production_url_match.length > 0)
    var s_account = wa_production_report_suite;
else
    var s_account = wa_dev_report_suite;

var pageNameOverride = currentHostname + location.pathname.toLowerCase();