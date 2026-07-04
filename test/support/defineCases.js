export const defineCases = (casesByName, assertCase) => {
  Object.entries(casesByName).forEach(([caseName, testCase]) => {
    test(caseName, () => assertCase(testCase, caseName));
  });
};
