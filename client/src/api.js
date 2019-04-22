import { errorNotification } from './shared';
const baseUrl = './search';

export const apiSuggest = (value, callback) => {
  $.getJSON(`${baseUrl}/suggest?keyword=${value}`, (data) => {
      callback(data);
    });
}

export const apiSuggestMisSpelled = (value, callback) => {
  $.getJSON(`${baseUrl}/suggestMisSpelled?keyword=${value}`, (data) => {
    callback(data);
  });
}

export const apiGDCDictionaryVersion = (callback) => {
  $.getJSON(`${baseUrl}/gdcDictionaryVersion`, (result) => {
    callback(result);
  });
}

export const apiSearchAll = (keyword, option, callback) => {
  $.getJSON(`${baseUrl}/all/p`, {keyword:keyword, option: JSON.stringify(option)}, function(result) {
      callback(keyword, option, result);
    }).fail(function(xhr, textStatus, errorThrown){
      errorNotification(xhr.status, errorThrown);
    });
}

export const apiGetGDCDataById = (id, callback) => {
  $.getJSON(`${baseUrl}/p/local/vs`, {id:id}, function(result){
      callback(id,result);
    }).fail(function(xhr, textStatus, errorThrown){
      errorNotification(xhr.status, errorThrown);
    });
}

export const apiGetGDCandCDEDataById = (ids, callback) => {
  $.getJSON(`${baseUrl}/p/both/vs`, {local:ids.local, cde: ids.cde}, function(result){
      callback(ids,result);
    }).fail(function(xhr, textStatus, errorThrown){
      errorNotification(xhr.status, errorThrown);
    });
}

export const apiEVSRest = (id, callback) => {
  $.getJSON(`${baseUrl}/ncit/detail?code=${id}`, function(result){
      callback(id,result);
    }).fail(function(xhr, textStatus, errorThrown){
      errorNotification(xhr.status, errorThrown);
    });
}
