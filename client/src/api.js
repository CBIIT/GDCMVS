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
  searchAll(keyword, option, callback) {
    $.getJSON(baseUrl + '/all/p', {keyword:keyword, option: JSON.stringify(option)}, function(result){
        let items = result;
        callback(keyword, option, items);
      });
  },
  getGDCDataById(id, callback){
    $.getJSON(baseUrl + '/p/local/vs', {id:id}, function(result){
        callback(id,result);
      });
  },
  getCDEDataById(id, callback){
    $.getJSON(baseUrl + '/p/cde/vs', {id:id}, function(result){
        callback(id,result);
      });
  },
  getGDCandCDEDataById(ids, callback){
    $.getJSON(baseUrl + '/p/both/vs', {local:ids.local, cde: ids.cde}, function(result){
        callback(ids,result);
      });
  },
  evsRestApi(id, callback){

    $.ajax({
      type: 'GET',
      url: 'https://evsrestapi-stage.nci.nih.gov/evsrestapi/api/v1/ctrp/concept/' + id,
      // headers: {
      //   'Access-Control-Allow-Origin': '*'
      // },
      //crossDomain: true,
      dataType: 'json',
      success: function(result){
        console.log(result);
        //callback(id,result);
      }
    });

    // $.getJSON('https://evsrestapi-stage.nci.nih.gov/evsrestapi/api/v1/ctrp/concept/' + id +'?callback=?', function(result){
    //   callback(id,result);
    // });
  }
}

export default api;
