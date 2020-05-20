const baseUrl = './search';

export const apiSuggest = async keyword => {
  const response = await fetch(`${baseUrl}/suggest?keyword=${keyword}`);
  return response.json();
};

export const apiSearchAll = async(keyword, options) => {
  const opts = `${options.match === true ? `exact` : `partial`}${options.syns === true ? `,syn` : ``}${options.desc === true ? `,desc` : ``}`;
  const response = await fetch(`${baseUrl}/all/p?keyword=${keyword}&options=${opts}`);
  return response.json();
};

export const apiGetGDCDataById = async(id) => {
  const response = await fetch(`${baseUrl}/p/local/vs?id=${id}`);
  return response.json();
};
