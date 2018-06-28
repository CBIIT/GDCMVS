
let tmpl = {
  toCompare: '<div id="compare_dialog">'
                    +'<div id="compare_form" class="compare-form">'
                        +'<div id="cp_top" class="compare-form__top">'
                            +'<label for="cp_input"class="compare-form__label--left">User Defined Values:</label>'
                            +'<label class="compare-form__label--right">GDC Values:</label>'
                            +'<div id="cp_left" class="compare-form__left">'
                            +'<textarea id="cp_input" class="compare-form__textarea" rows="10" cols="20" placeholder="Input values line by line" autocomplete="off"></textarea></div>'
                            +'<div id="cp_middle" class="compare-form__middle"></div>'
                            +'<div id="cp_right" class="compare-form__right" tabindex="0" aria-label="gdc values">'
                            +'{{for items}}'
                            +'<div>{{:n}}</div>'
                            +'{{/for}}'
                            +'</div>'
                        +'</div>'
                        +'<div id="cp_massage" class="compare-form__message"></div>'
                        +'<div id="cp_bottom" class="compare-form__bottom">'
                            +'<button id="compare" class="btn btn-default compare-form__button">Compare</button>'
                            +'<button id="cancelCompare" class="btn btn-default compare-form__button compare-form__button--cancel">Cancel</button>'
                        +'</div>'
                    +'</div>'
                    +'<div id="compare_result" class="compare_result"></div>'
                +'</div>'
};

export default tmpl;
