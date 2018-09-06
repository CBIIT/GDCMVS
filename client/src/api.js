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
  searchAll(keyword, option, callback, error) {
    $.getJSON(baseUrl + '/all/p', {keyword:keyword, option: JSON.stringify(option)}, function(result) {
        callback(keyword, option, result);
      }).fail(function(xhr, textStatus, errorThrown){
        error();
      });
  },
  getGDCDataById(id, callback, error){
    $.getJSON(baseUrl + '/p/local/vs', {id:id}, function(result){
        callback(id,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error();
      });
  },
  getCDEDataById(id, callback, error){
    $.getJSON(baseUrl + '/p/cde/vs', {id:id}, function(result){
        callback(id,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error();
      });
  },
  getGDCandCDEDataById(ids, callback, error){
    $.getJSON(baseUrl + '/p/both/vs', {local:ids.local, cde: ids.cde}, function(result){
        callback(ids,result);
      }).fail(function(xhr, textStatus, errorThrown){
        error();
      });
  },
  evsRestApi(id, callback, error){
    $.getJSON(baseUrl + '/ncit/detail?code=' + id, function(result){
      callback(id,result);
    }).fail(function(){
      error();
    });
  }
}

export default api;
