// index.js should run without errors.
describe('index', () => {
  it('index.js has no error', () => {
    document.body.innerHTML = '<div id="root"></div>';
    require('../src/index');
  });
});
