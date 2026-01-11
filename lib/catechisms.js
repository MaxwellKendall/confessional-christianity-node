// Available catechisms for progress tracking (children)
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

// All creedal documents (for personal "me" progress tracking)
export const CREEDAL_DOCUMENTS = {
  // Catechisms (Question & Answer format)
  WSC: {
    id: 'WSC',
    name: 'Westminster Shorter Catechism',
    shortName: 'WSC',
    totalItems: 107,
    itemLabel: 'Question',
    itemLabelPlural: 'Questions',
    type: 'catechism',
    tradition: 'Westminster Standards',
    description: 'A summary of doctrine intended for those beginning their Christian education',
  },
  WLC: {
    id: 'WLC',
    name: 'Westminster Larger Catechism',
    shortName: 'WLC',
    totalItems: 196,
    itemLabel: 'Question',
    itemLabelPlural: 'Questions',
    type: 'catechism',
    tradition: 'Westminster Standards',
    description: 'A more comprehensive catechism for those who have profited by the Shorter Catechism',
  },
  CFYC: {
    id: 'CfYC',
    name: 'Catechism for Young Children',
    shortName: 'CfYC',
    totalItems: 145,
    itemLabel: 'Question',
    itemLabelPlural: 'Questions',
    type: 'catechism',
    tradition: 'Other',
    description: 'An introductory catechism designed for young children',
  },
  HC: {
    id: 'HC',
    name: 'Heidelberg Catechism',
    shortName: 'HC',
    totalItems: 129,
    itemLabel: 'Question',
    itemLabelPlural: 'Questions',
    type: 'catechism',
    tradition: 'Three Forms of Unity',
    description: 'A Protestant catechism taking the form of a series of questions and answers',
  },
  // Confessions (Chapter format)
  WCF: {
    id: 'WCF',
    name: 'Westminster Confession of Faith',
    shortName: 'WCF',
    totalItems: 33,
    itemLabel: 'Chapter',
    itemLabelPlural: 'Chapters',
    type: 'confession',
    tradition: 'Westminster Standards',
    description: 'The principal confessional standard of Presbyterian churches worldwide',
  },
  BCF: {
    id: 'BCF',
    name: 'Belgic Confession of Faith',
    shortName: 'BCF',
    totalItems: 37,
    itemLabel: 'Article',
    itemLabelPlural: 'Articles',
    type: 'confession',
    tradition: 'Three Forms of Unity',
    description: 'One of the Three Forms of Unity, a confession of the Reformed churches',
  },
  CD: {
    id: 'CD',
    name: 'Canons of Dort',
    shortName: 'CD',
    totalItems: 4,
    itemLabel: 'Head of Doctrine',
    itemLabelPlural: 'Heads of Doctrine',
    type: 'confession',
    tradition: 'Three Forms of Unity',
    description: 'The judgment of the Synod of Dort on the Five Articles of the Remonstrants',
  },
  TAR: {
    id: 'TAR',
    name: 'Thirty-Nine Articles',
    shortName: '39A',
    totalItems: 39,
    itemLabel: 'Article',
    itemLabelPlural: 'Articles',
    type: 'confession',
    tradition: 'Anglican',
    description: 'The defining statements of Anglican doctrine',
  },
  '95T': {
    id: '95T',
    name: 'Ninety-Five Theses',
    shortName: '95T',
    totalItems: 95,
    itemLabel: 'Thesis',
    itemLabelPlural: 'Theses',
    type: 'theses',
    tradition: 'Reformation',
    description: 'Martin Luther\'s propositions that sparked the Protestant Reformation',
  },
};

export const getCatechismById = (id) => {
  const upperCaseId = id?.toUpperCase();
  if (upperCaseId === 'CFYC') return CATECHISMS.CFYC;
  return CATECHISMS[upperCaseId] || null;
};

export const getDocumentById = (id) => {
  if (!id) return null;
  const upperCaseId = id.toUpperCase();
  if (upperCaseId === 'CFYC') return CREEDAL_DOCUMENTS.CFYC;
  return CREEDAL_DOCUMENTS[upperCaseId] || null;
};

export const getCatechismList = () => Object.values(CATECHISMS);

export const getDocumentList = () => Object.values(CREEDAL_DOCUMENTS);

export const getDocumentsByTradition = () => {
  const documents = Object.values(CREEDAL_DOCUMENTS);
  const grouped = {};
  
  documents.forEach(doc => {
    if (!grouped[doc.tradition]) {
      grouped[doc.tradition] = [];
    }
    grouped[doc.tradition].push(doc);
  });
  
  // Return in a specific order
  return [
    { tradition: 'Westminster Standards', documents: grouped['Westminster Standards'] || [] },
    { tradition: 'Three Forms of Unity', documents: grouped['Three Forms of Unity'] || [] },
    { tradition: 'Anglican', documents: grouped['Anglican'] || [] },
    { tradition: 'Reformation', documents: grouped['Reformation'] || [] },
    { tradition: 'Other', documents: grouped['Other'] || [] },
  ].filter(g => g.documents.length > 0);
};

export const generateCatechismLink = (catechismId, questionNumber) => {
  // Use the app's existing URL format
  return `/?search=${catechismId}.${questionNumber}`;
};

export const generateDocumentLink = (documentId, itemNumber) => {
  // Use the app's existing URL format
  return `/?search=${documentId}.${itemNumber}`;
};

export const calculateProgress = (currentQuestion, totalQuestions) => {
  if (!currentQuestion || !totalQuestions) return 0;
  return Math.round((currentQuestion / totalQuestions) * 100);
};
