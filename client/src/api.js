const baseUrl = './search';

const api = {
  suggest(value, callback) {
    $.getJSON({
  	url: baseUrl + "/suggest?keyword=" + value,
  	success: function(data) {
  	  callback(data);
  	}
    });
  },
  suggestMisSpelled(value, callback) {
    $.getJSON({
  	url: baseUrl + "/suggestMisSpelled?keyword=" + value,
  	success: function(data) {
  	  callback(data);
  	}
    });
  },
  searchAll(keyword, option, callback, error) {
    $.getJSON(baseUrl + '/all/p', {keyword:keyword, option: JSON.stringify(option)}, function(result) {
        callback(keyword, option, result);
      }).fail(function(xhr, textStatus, errorThrown){
        error(xhr.status, errorThrown);
      });
  },
  getGDCDataById(id, callback, error){
    $.getJSON(baseUrl + '/p/local/vs', {id:id}, function(result){
        callback(id,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error(xhr.status, errorThrown);
      });
  },
  getCDEDataById(id, callback, error){
    $.getJSON(baseUrl + '/p/cde/vs', {id:id}, function(result){
        callback(id,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error(xhr.status, errorThrown);
      });
  },
  getGDCandCDEDataById(ids, callback, error){
    $.getJSON(baseUrl + '/p/both/vs', {local:ids.local, cde: ids.cde}, function(result){
        callback(ids,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error(xhr.status, errorThrown);
      });
  },
  evsRestApi(id, callback, error){
    $.getJSON(baseUrl + '/ncit/detail?code=' + id, function(result){
      callback(id,result);
    }).fail(function(xhr, textStatus, errorThrown){
      error(xhr.status, errorThrown);
    });
  }
}

export default api;
