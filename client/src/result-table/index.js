import tmpl from './view';

const func = {
  render() {
 
    let html = $.templates(tmpl).render();

    return html;

  }
};

export default func;