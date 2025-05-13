import { errorNotification } from './shared';
const baseUrl = 'https://gdc-mvs.nci.nih.gov/gdc/search';

export const apiSuggest = (value, callback) => {
  $.getJSON(`${baseUrl}/suggest?keyword=${value}`, (data) => {
    callback(data);
  });
};

export const apiSuggestMisSpelled = (value, callback) => {
  $.getJSON(`${baseUrl}/suggestMisSpelled?keyword=${value}`, (data) => {
    callback(data);
  });
};

export const apiGDCDictionaryVersion = (callback) => {
  $.getJSON(`${baseUrl}/gdcDictionaryVersion`, (result) => {
    callback(result);
  });
};

export const apiSearchAll = (keyword, options, callback) => {
  const opts = `${options.match}${options.syn === true ? `,syn` : ``}${options.desc === true ? `,desc` : ``}`;

  $.getJSON(`${baseUrl}/all/p`, { keyword: keyword, options: opts }, function (result) {
    callback(keyword, options, result);
  }).fail(function (xhr, textStatus, errorThrown) {
    errorNotification(xhr.status, errorThrown);
  });
};

export const apiGetGDCDataById = (id, callback) => {
  $.getJSON(`${baseUrl}/p/local/vs`, { id: id }, function (result) {
    callback(id, result);
  }).fail(function (xhr, textStatus, errorThrown) {
    errorNotification(xhr.status, errorThrown);
  });
};

export const apiGetGDCandCDEDataById = (ids, callback) => {
  $.getJSON(`${baseUrl}/p/both/vs`, { local: ids.local, cde: ids.cde }, function (result) {
    callback(ids, result);
  }).fail(function (xhr, textStatus, errorThrown) {
    errorNotification(xhr.status, errorThrown);
  });
};

export const apiEVSRest = (id, callback) => {
  $.getJSON(`${baseUrl}/ncit/detail?code=${id}`, function (result) {
    callback(id, result);
  }).fail(function (xhr, textStatus, errorThrown) {
    errorNotification(xhr.status, errorThrown);
  });
};
