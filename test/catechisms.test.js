import {
  calculateProgress,
  generateCatechismLink,
  generateDocumentLink,
  getCatechismById,
  getDocumentById,
  getDocumentsByTradition,
} from '../lib/catechisms';
import { defineCases } from './support/defineCases';

describe('catechism metadata', () => {
  const cases = {
    'getCatechismById normalizes ids and resolves CfYC aliases': {
      actual: () => ({
        wsc: getCatechismById('wsc'),
        cfyc: getCatechismById('CFYC'),
      }),
      assert: ({ wsc, cfyc }) => {
        expect(wsc).toMatchObject({
          id: 'WSC',
          totalQuestions: 107,
        });
        expect(cfyc).toMatchObject({
          id: 'CfYC',
          totalQuestions: 145,
        });
      },
    },
    'getDocumentById normalizes ids and resolves CfYC aliases': {
      actual: () => ({
        wcf: getDocumentById('wcf'),
        cfyc: getDocumentById('CfYC'),
      }),
      assert: ({ wcf, cfyc }) => {
        expect(wcf).toMatchObject({
          id: 'WCF',
          itemLabel: 'Chapter',
        });
        expect(cfyc).toMatchObject({
          id: 'CfYC',
          itemLabel: 'Question',
        });
      },
    },
    'getDocumentsByTradition preserves the intended display order': {
      actual: () => getDocumentsByTradition().map(({ tradition }) => tradition),
      expected: [
        'Westminster Standards',
        'Three Forms of Unity',
        'Anglican',
        'Reformation',
        'Other',
      ],
    },
  };

  defineCases(cases, ({ actual, assert, expected }) => {
    const result = actual();
    if (assert) {
      assert(result);
      return;
    }
    expect(result).toEqual(expected);
  });
});

describe('progress and links', () => {
  const cases = {
    'generateCatechismLink preserves the search route format': {
      actual: () => generateCatechismLink('WSC', 12),
      expected: '/?search=WSC.12',
    },
    'generateDocumentLink preserves the search route format': {
      actual: () => generateDocumentLink('WCF', 3),
      expected: '/?search=WCF.3',
    },
    'calculateProgress returns zero when inputs are missing': {
      actual: () => calculateProgress(null, 107),
      expected: 0,
    },
    'calculateProgress rounds to the nearest whole percent': {
      actual: () => calculateProgress(17, 107),
      expected: 16,
    },
    'calculateProgress returns full completion at the upper bound': {
      actual: () => calculateProgress(107, 107),
      expected: 100,
    },
  };

  defineCases(cases, ({ actual, expected }) => {
    expect(actual()).toEqual(expected);
  });
});
