import tmpl from './dict-table.html';

const treeviewToggleHandle = (event) => {
  event.preventDefault();
  const  $this = $(event.currentTarget);
  const $target = $this.closest('.treeview__parent');
  $target.find('>ul.treeview__ul').toggle();
  if ($target.hasClass('treeview__parent--open')) {
    $target.removeClass('treeview__parent--open');
    $this.attr('aria-label', 'expand');
    $this.html('<i class="fa fa-angle-down"></i>');
  } else {
    $target.addClass('treeview__parent--open');
    $this.attr('aria-label', 'collapse');
    $this.html('<i class="fa fa-angle-up"></i>');
  }
}

const treeviewShowAllValuesHandle = (event) => {
  const target = event.currentTarget;
  const $treeviewHl = $('.treeview__ul--hl');
  const $treeviewAll = $('.treeview__ul--all');
  if (target.checked) {
    $treeviewAll.addClass('treeview__ul').each((index, event) => {
      const $this = $(event);
      const $prev = $this.prev('.treeview__ul--hl');
      if ($prev.is(':visible')) {
        $this.show();
        $prev.hide();
      }
    });
    $treeviewHl.removeClass('treeview__ul');
  } else {
    $treeviewHl.addClass('treeview__ul').each((index, event) => {
      const $this = $(event);
      const $next = $this.next('.treeview__ul--all');
      if ($next.is(':visible')) {
        $this.show();
        $next.hide();
      }
    });
    $treeviewAll.removeClass('treeview__ul');
  }
}

const treeviewToggleAllHandle = (event) => {
  const $this = $(event.currentTarget);
  const $tview_ul = $('.treeview .treeview__ul');
  const $tview_li = $('.treeview .treeview__parent');
  const $tview_trigger = $('.treeview .treeview__toggle');
  if ($this.hasClass('active')) {
    $tview_ul.hide();
    $tview_li.removeClass('treeview__parent--open');
    $tview_trigger.attr('aria-label', 'expand');
    $tview_trigger.html('<i class="fa fa-angle-down"></i>');
    $this.html('<i class="fa fa-angle-down"></i> Expand All');
  } else {
    $tview_ul.show();
    $tview_li.addClass('treeview__parent--open');
    $tview_trigger.attr('aria-label', 'collapse');
    $tview_trigger.html('<i class="fa fa-angle-up"></i>');
    $this.html('<i class="fa fa-angle-up"></i>  Collapse All');
  }
}

export const dtRender = (items, keyword, search_option) => {
  //data preprocessing
  //current category
  let category = "";
  //current node
  let node = "";
  //prefix for property and value id
  let count = 0;
  //data generated
  let trs = [];

  //category row
  let c = {};
  //node row
  let n = {};
  //final result
  let result = {};
  result.len = 0;
  //options render
  let options = {};
  // RegExp Keyword
  keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
  let reg_key = new RegExp(keyword, "ig");
  let gdc_p = [];


  let offset = $('#root').offset().top;
  let h = window.innerHeight - offset - 313;
  options.height = (h < 430) ? 430 : h;
  let html = $.templates(tmpl).render({
    options: options,
    newtrs: trs
  });
  result.html = html;
  return result;
}

export const dtEvents = ($root) => {
  $root.on('click', '.treeview__toggle', (event) => {
    treeviewToggleHandle(event);
  });

  $root.on('click', '#trs-checkbox', (event) => {
    treeviewShowAllValuesHandle(event);
  });

  $root.on('click', '#trs_toggle', (event) => {
    treeviewToggleAllHandle(event);
  });
}
