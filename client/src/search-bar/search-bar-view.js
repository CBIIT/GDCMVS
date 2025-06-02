const template = (results) => {
  return `
    <template-suggest>
    ${results.map((suggestion) => `
      <div class="suggest__object">
        <span class="suggest__name">${suggestion.id}</span>
        <span class="suggest__type">
          ${suggestion.type.map((value, index) => `
            ${index !== 0 ? `, ` : ``}${value}
          `.trim()).join('')}
        </span>
      </div>
    `.trim()).join('')}
    </template-suggest>
  `;
};

export default template;
