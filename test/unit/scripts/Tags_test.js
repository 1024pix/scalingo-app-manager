const { expect } = require('chai');

const { Tags } = require('../../../scripts/Tags');

describe('Unit | Script | Tags', () => {

  describe('#getTagByTitle', () => {

    [
      {
        testTitle: 'Tag.BUGFIX if title include [BUGFIX]',
        pullRequestTitle: '[BUGFIX] Pull Request Title',
        expectedTag: Symbol.for('bugfix')
      },
      {
        testTitle: 'Tag.FEATURE if title include [FEATURE]',
        pullRequestTitle: '[FEATURE] Pull Request Title',
        expectedTag: Symbol.for('feature'),
      },
      {
        testTitle: 'Tag.OTHERS if title does not include listed tag',
        pullRequestTitle: '[FIX] Pull Request Title',
        expectedTag: Symbol.for('others'),
      },
      {
        testTitle: 'Tag.QUICK_WIN if title include [QUICK WIN]',
        pullRequestTitle: '[QUICK WIN] Pull Request Title',
        expectedTag: Symbol.for('quickWin'),
      },
      {
        testTitle: 'Tag.TECH if title include [TECH]',
        pullRequestTitle: '[TECH] Pull Request Title',
        expectedTag: Symbol.for('tech'),
      },

    ].forEach((testCase) => {
      it(`should return ${testCase.testTitle}`, () => {
        // when
        const tag = Tags.getTagByTitle(testCase.pullRequestTitle);

        // then
        expect(tag).to.equal(testCase.expectedTag);
      });
    });
  });
});
