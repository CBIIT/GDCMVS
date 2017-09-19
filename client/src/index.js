
import func from './search-bar/';

$("#searchProperty").bind("click", func.search);

$("#keywords").bind("keypress", func.gotoSearch);

$("#keywords").bind("keydown", func.selectSuggestion);

$("#keywords").bind("input", func.suggest);


