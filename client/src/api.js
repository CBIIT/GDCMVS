const baseUrl = 'http://ec2-54-152-84-22.compute-1.amazonaws.com/gdc/search/';

const api = {
  suggest(value, callback) {
    $.getJSON({
  	url: "http://ec2-54-152-84-22.compute-1.amazonaws.com/gdc/search/suggest?keyword=" + value,
  	success: function(data) {
  		//console.log(data);
  	  callback(data);
  	}
    });
  },
  searchAll(keyword, option, callback) {
    $.getJSON(baseUrl + 'all', {keyword:keyword, option: JSON.stringify(option)}, function(result){
        let items = [];
        if(result.length !== 0){
            result.forEach(function(hit){
                let it = {};
                it.doc = hit._source;
                it.highlight = hit.highlight;
                items.push(it);
            });
        }
        callback(keyword, option, items);
      });
  }
}

export default api;
