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
    fetch(baseUrl+'/all/p?'+ $.param({keyword:keyword, option: JSON.stringify(option)}))
      .then(result => {
        if(result.ok === false) throw result;
        return result.json();
      })
      .then(data =>{
        callback(keyword, option, data);
      })
      .catch(err => {
        error(err.status, err.statusText);
      });
      // $.getJSON(baseUrl + '/all/p', {keyword:keyword, option: JSON.stringify(option)}, function(result) {
      //   callback(keyword, option, result);
      // }).fail(function(xhr, textStatus, errorThrown){
      //   error(xhr.status, errorThrown);
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
