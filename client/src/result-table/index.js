import tmpl from './view';

const func = {
  render(items) {
 	//data preprocessing
    let html = $.templates(tmpl).render();

    return html;

  }
};

export default func;