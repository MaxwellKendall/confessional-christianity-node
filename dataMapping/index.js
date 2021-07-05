export const confessionCitationByIndex = {
  WCF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  WCoF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  WCOF: ['Westminster Confession of Faith', 'Chapter', 'Article', 'Scripture Citation'],
  HC: ['Heidelberg Catechism', 'LORD\'s Day', 'Question and Answer', 'Scripture Citation'],
  WSC: ['Westminster Shorter Catechism', 'Question and Answer', 'Scripture Citation'],
  WLC: ['Westminster Larger Catechism', 'Question and Answer', 'Scripture Citation'],
  '39A': ['Thirty-nine Articles of Religion', 'Chapter'],
  CD: ['Canons of Dort', 'Chapter'],
  COD: ['Canons of Dort', 'Chapter'],
  BCF: ['The Belgic Confession of Faith', 'Chapter'],
  '95T': ['Martin Luther\'s 95 theses'],
};

export const confessionPathByName = {
  'westminster-confession-of-faith': 'normalized-data/westminster/wcf.json',
  'westminster-larger-catechism': 'normalized-data/westminster/wlc.json',
  'westminster-shorter-catechism': 'normalized-data/westminster/wsc.json',
  'heidelberg-catechism': 'normalized-data/three-forms-of-unity/heidelberg-catechism.json',
  'canons-of-dort': 'normalized-data/three-forms-of-unity/canons-of-dort.json',
  'belgic-confession': 'normalized-data/three-forms-of-unity/belgic-confession.json',
  '39-articles': 'normalized-data/anglican/39-articles.json',
  '95-theses': 'normalized-data/reformation/95-theses.json',
};

export const parentIdByAbbreviation = {
  WCF: 'WCoF',
  WCOF: 'WCoF',
  HC: 'HC',
  WLC: 'WLC',
  WSC: 'WSC',
  CD: 'CoD',
  COD: 'CoD',
  BCF: 'TBCoF',
  '39A': 'TAoR',
  '95T': 'ML9t',
};

export const confessionIdsWithoutTitles = [
  'WSC',
  'WLC',
  'BCoF',
  'TBCoF',
  'TAoR',
  'ML9t',
];
