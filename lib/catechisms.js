// Available catechisms for progress tracking
export const CATECHISMS = {
  WSC: {
    id: 'WSC',
    name: 'Westminster Shorter Catechism',
    shortName: 'WSC',
    totalQuestions: 107,
    description: 'A summary of doctrine intended for those beginning their Christian education',
    ageRange: '8-12',
  },
  WLC: {
    id: 'WLC',
    name: 'Westminster Larger Catechism',
    shortName: 'WLC',
    totalQuestions: 196,
    description: 'A more comprehensive catechism for those who have profited by the Shorter Catechism',
    ageRange: '12+',
  },
  CFYC: {
    id: 'CfYC',
    name: 'Catechism for Young Children',
    shortName: 'CfYC',
    totalQuestions: 145,
    description: 'An introductory catechism designed for young children',
    ageRange: '4-8',
  },
  HC: {
    id: 'HC',
    name: 'Heidelberg Catechism',
    shortName: 'HC',
    totalQuestions: 129,
    description: 'A Protestant catechism taking the form of a series of questions and answers for instructing youth',
    ageRange: '10+',
  },
};

export const getCatechismById = (id) => {
  const upperCaseId = id?.toUpperCase();
  if (upperCaseId === 'CFYC') return CATECHISMS.CFYC;
  return CATECHISMS[upperCaseId] || null;
};

export const getCatechismList = () => Object.values(CATECHISMS);

export const generateCatechismLink = (catechismId, questionNumber) => {
  // Use the app's existing URL format
  return `/?search=${catechismId}.${questionNumber}`;
};

export const calculateProgress = (currentQuestion, totalQuestions) => {
  if (!currentQuestion || !totalQuestions) return 0;
  return Math.round((currentQuestion / totalQuestions) * 100);
};
