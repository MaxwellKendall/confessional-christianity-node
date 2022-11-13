export const confessionCitationByIndex = {
  WCF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  WCoF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  WCOF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  HC: ['Heidelberg Catechism', 'LORD\'s Day', 'Question and Answer', 'Scripture Citation'],
  WSC: ['Westminster Shorter Catechism', 'Question and Answer', 'Scripture Citation'],
  WLC: ['Westminster Larger Catechism', 'Question and Answer', 'Scripture Citation'],
  '39A': ['Thirty-nine Articles of Religion', 'Chapter'],
  TAR: ['Thirty-nine Articles of Religion', 'Chapter'],
  TAOR: ['Thirty-nine Articles of Religion', 'Chapter'],
  CD: ['Canons of Dort', 'Chapter'],
  COD: ['Canons of Dort', 'Chapter'],
  BCF: ['The Belgic Confession of Faith', 'Chapter'],
  TBCoF: ['The Belgic Confession of Faith', 'Chapter'],
  TBCOF: ['The Belgic Confession of Faith', 'Chapter'],
  BC: ['The Belgic Confession of Faith', 'Chapter'],
  '95T': ['Martin Luther\'s 95 theses'],
  ML9T: ['Martin Luther\'s 95 theses'],
  ALL: ['ALL'],
};

export const confessionPathByName = {
  'westminster-confession-of-faith': 'normalized-data/westminster/wcf.json',
  'westminster-larger-catechism': 'normalized-data/westminster/wlc.json',
  'westminster-shorter-catechism': 'normalized-data/westminster/wsc.json',
  'heidelberg-catechism': 'normalized-data/three-forms-of-unity/heidelberg-catechism.json',
  'canons-of-dort': 'normalized-data/three-forms-of-unity/canons-of-dort.json',
  'the-belgic-confession-of-faith': 'normalized-data/three-forms-of-unity/belgic-confession.json',
  'thirty-nine-articles-of-religion': 'normalized-data/anglican/39-articles.json',
  'martin-luthers-95-theses': 'normalized-data/reformation/95-theses.json',
};

// canonical docIds in algolia 🤦
export const parentIdByAbbreviation = {
  WCF: 'WCoF',
  WCOF: 'WCoF',
  HC: 'HC',
  WLC: 'WLC',
  WSC: 'WSC',
  CD: 'CoD',
  COD: 'CoD',
  BCF: 'TBCoF',
  TAR: 'TAoR',
  '39A': 'TAoR',
  '95T': 'ML9t',
  ML9T: 'ML9t',
};

export const DOCUMENTS_WITHOUT_ARTICLES = [
  'ML9T',
  'BCF',
  'TAR',
  'WLC',
  'WSC',
];

export const confessionIdsWithoutTitles = [
  'WSC',
  'WLC',
  'BCoF',
  'TBCoF',
  'TAoR',
  'ML9t',
];

export const excludedWordsInDocumentId = [
  'OF',
  'THE',
];

export const facetNamesByCanonicalDocId = {
  WCF: ['chapter', 'article'],
  BCF: ['chapter'],
  HC: ['lords day', 'question'],
  CD: [['chapter', 'rejection'], ['chapter', 'article']],
  '39A': ['chapter'],
  ML9T: ['thesis'],
  WLC: ['question'],
  WSC: ['question'],
};

export const KEYWORDS = [
  'westminster standards',
  'three forms of unity',
  '3 forms of unity',
  'six forms of unity',
  '6 forms of unity',
];
