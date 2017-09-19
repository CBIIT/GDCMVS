import tmpl from './view';

const func = {
  render(items) {
 
    let html = $.templates(tmpl).render({items: items });

    return html;

  }
};

export default func;