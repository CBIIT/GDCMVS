const baseUrl = './search';

export const apiSuggest = async keyword => {
  const response = await fetch(`${baseUrl}/suggest?keyword=${keyword}`);
  return response.json();
};

export const apiSearchAll = async(keyword, options) => {
  // const opts = `${options.match}${options.syn === true ? `,syn` : ``}${options.desc === true ? `,desc` : ``}`;
  const opts = `partial`;
  const response = await fetch(`${baseUrl}/all/p?keyword=${keyword}&options=${opts}`);
  return response.json();
};
