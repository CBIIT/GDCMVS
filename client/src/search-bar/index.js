import api from '../api';
import render from '../render'

export default function search(){
    let keyword = $("#keywords").val();
    keyword = keyword.toLowerCase();
    let option = {};
    option.desc = $("#i_desc").prop('checked');
    option.syn = $("#i_syn").prop('checked');
    option.match = $("input[name=i_match]:checked").val();
    $("#suggestBox").css("display","none");
    //displayBoxIndex = -1;
    api.searchAll(keyword, option, function(keyword, option, items) {
      //console.log(items);
      render(keyword, option, items);
    });
}
