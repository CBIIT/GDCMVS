export const getAllSyn = (items) => {
  items.forEach(em => {
    if (em.n_syn !== undefined) {
      em.all_syn = [];
      em.n_syn.forEach(syn => {
        em.all_syn = em.all_syn.concat(syn.s.map((x) => { return x.termName; }));
      });
    }
  });
  return items;
};

export const sortAlphabetically = (values) => {
  values.sort((a, b) => {
    const an = a.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase();
    const bn = b.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase();
    if (an > bn) { return 1; }
    if (bn > an) { return -1; }
    return 0;
  });
  return values;
};

export const sortSynonyms = (synonyms) => {
  const mapped = { PT: 1, BR: 2, FB: 3, CN: 4, AB: 5, SY: 6, SN: 7, AD: 8, AQ: 9, AQS: 10 };
  synonyms.sort((a, b) => (mapped[a.termGroup] > mapped[b.termGroup]) ? 1 : (a.termGroup === b.termGroup) ? ((a.termName.toLowerCase() > b.termName.toLowerCase()) ? 1 : -1) : -1);
  return synonyms;
};

export const getHighlightObj = (highlight) => {
  let highlightObj = {};
  if (highlight !== undefined) {
    highlight.forEach(val => {
      let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
      if (highlightObj[tmp] === undefined) highlightObj[tmp] = val;
    });
  }
  return highlightObj;
};

export const getAllValueHighlight = (enumHits) => {
  let highlightValueObj = {};
  enumHits.hits.forEach(emHit => {
    let emHighlight = emHit.highlight;
    let highlightValue = ('enum.n' in emHighlight) || ('enum.n.have' in emHighlight) ? emHighlight['enum.n'] || emHighlight['enum.n.have'] : undefined;
    if (highlightValue !== undefined) {
      highlightValue.forEach(val => {
        let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
        if (highlightValueObj[tmp] === undefined) highlightValueObj[tmp] = val;
      });
    }
  });
  return highlightValueObj;
};
