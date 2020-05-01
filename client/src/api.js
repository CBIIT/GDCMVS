const baseUrl = './search';

export const apiSuggest = async value => {
  const response = await fetch(`${baseUrl}/suggest?keyword=${value}`);
  return response.json();
};
