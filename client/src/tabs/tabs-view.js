const template = (options) => {
  return `
    <template-tabs>
      <div class="results">
        <div class="tab-nav">
          <div class="tab-nav__text">Results for
            <span class="tab-nav__term">${options.keyword}</span> in:
          </div>
          <div id="tab" class="btn-group tab-nav__group" role="group">
            <ul class="tab-nav__ul" role="tablist">
              <li role="presentation" class="tab-nav__li">
                <div class="tab-nav__tooltip tooltip-target" data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="For a search term, the values tab displays matches among the accepted values for GDC metadata properties. These values will pass validation when submitted under the corresponding property.">
                  <a id="tab-values" href="#values" class="tab-nav__btn ${options.vs_active === true ? `active` : ``}" aria-controls="values" role="tab" data-bs-toggle="tab" aria-expanded="true">Values</a>
                  <span class="tab-nav__notification">${options.vs_len}</span>
                </div>
              </li>
              <li role="presentation" class="tab-nav__li">
                <div class="tab-nav__tooltip tooltip-target" data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="For a search term, the properties tab displays matches among valid GDC metadata properties. These can be thought of as the valid column headings that accept values related to the case or other object being described.">
                  <a id="tap-properties" href="#properties" class="tab-nav__btn ${options.ps_active === true ? `active` : ``}" aria-controls="properties" role="tab" data-bs-toggle="tab" aria-expanded="true">Properties</a>
                  <span class="tab-nav__notification">${options.ps_len}</span>
                </div>
              </li>
              <li role="presentation" class="tab-nav__li">
                <div class="tab-nav__tooltip tooltip-target" data-bs-toggle="tooltip" data-bs-custom-class="custom-tooltip" data-bs-title="For a search term, this tab displays relevant matches in the context of the GDC Dictionary. The Dictionary defines the property names, the sets of accepted values for those properties, and contains readable definitions, links, and other information to aid users in understanding the vocabular.">
                  <a id="tab-dictionary" href="#dictionary" class="tab-nav__btn ${options.trs_active === true ? `active` : ``}" aria-controls="dictionary" role="tab" data-bs-toggle="tab" aria-expanded="true">Dictionary</a>
                  <span class="tab-nav__notification">${options.trs_len}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="tab-content">
          <div tabindex="0" role="tabpanel" class="tab-pane fade ${options.vs_active === true ? `active show` : ``}" id="values" aria-labelledby="tab-values">${options.vsHtml}</div>
          <div tabindex="0" role="tabpanel" class="tab-pane fade ${options.ps_active === true ? `active show` : ``}" id="properties" aria-labelledby="tab-properties">${options.psHtml}</div>
          <div tabindex="0" role="tabpanel" class="tab-pane fade ${options.trs_active === true ? `active show` : ``}" id="dictionary" aria-labelledby="tab-dictionary">${options.trsHtml}</div>
        </div>
      </div>
    </template-tabs>
  `;
};

export default template;
