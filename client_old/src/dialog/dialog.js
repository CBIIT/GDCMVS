import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details';
import sourceDetails from './source-details/source-details';
import typeDetails from './type-details/type-details';

export const dialogEvents = ($root, $body) => {
  $root.on('click', '.getGDCData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    gdcData(uid, data.tgt, data.keyword);
  });

  $root.on('click', '.toCompare', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    toCompare(uid);
  });

  $root.on('click', '.getGDCTerms', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    GDCTerms(uid, data.targets);
  });

  $body.on('click', '.getNCITDetails', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getNCITDetails(data.uid);
  });

  $body.on('click', '.getSourceDetails', (event) => {
    event.preventDefault();
    sourceDetails();
  });

  $body.on('click', '.getTypeDetails', (event) => {
    event.preventDefault();
    typeDetails();
  });

  $body.on('click', '.compare-form__toggle', (event) => {
    event.preventDefault();
    const $this = $(event.currentTarget);
    const $target = $this.closest('.compare-form__values, .table__gdc-match').find('.compare-form__synm');
    const $matched = $this.closest('.compare-form__values, .table__gdc-match').find('.compare-form__matched');
    $matched.slideToggle(350);
    $target.slideToggle(350, () => {
      if ($target.is(':visible')) {
        $this.attr('title', 'collapse');
        $this.attr('aria-label', 'collapse');
        $this.attr('aria-expanded', 'true');
        $this.html('<i class="fa fa-minus"></i>');
      } else {
        $this.attr('title', 'expand');
        $this.attr('aria-label', 'expand');
        $this.attr('aria-expanded', 'false');
        $this.html('<i class="fa fa-plus"></i>');
      }
    });
  });
};

export const removePopUps = () => {
  if ($('#gdc_data').length) {
    $('#gdc_data').remove();
  }

  if ($('#gdc_terms_data').length) {
    $('#gdc_terms_data').remove();
  }

  if ($('#ncit_details').length) {
    $('#ncit_details').remove();
  }

  if ($('#compare_dialog').length) {
    $('#compare_dialog').remove();
  }

  if ($('#type_details').length) {
    $('#type_details').remove();
  }

  if ($('#source_details').length) {
    $('#source_details').remove();
  }
};
