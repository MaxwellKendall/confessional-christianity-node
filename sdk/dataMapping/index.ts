type DocumentAbbreviation = 
  'WCF' |
  'WCoF' |
  'WCOF' |
  'HC' |
  'WSC' |
  'WLC' |
  '39A' |
  'TAR' |
  'TAOR' |
  'CD'  |
  'COD'  |
  'BCF' |
  'TBCoF'|
  'TBCOF' |
  'BC' |
  '95T' |
  'ML9T' |
  'ALL';

export const confessionCitationByIndex : Record<string, string[]> = {
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

export const confessionPathByName : Record<string, string> = {
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
export const parentIdByAbbreviation : Record<string, string>= {
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

export const DOCUMENTS_WITHOUT_ARTICLES : string[] = [
  'ML9T',
  'BCF',
  'TAR',
  'WLC',
  'WSC',
];

export const confessionIdsWithoutTitles : string[] = [
  'WSC',
  'WLC',
  'BCoF',
  'TBCoF',
  'TAoR',
  'ML9t',
];

export const excludedWordsInDocumentId :string[] = [
  'OF',
  'THE',
];

export const facetNamesByCanonicalDocId : Record<string, string[]| string[][]> = {
  WCF: ['chapter', 'article'],
  BCF: ['chapter'],
  HC: ['lords day', 'question'],
  CD: [['chapter', 'rejection'], ['chapter', 'article']],
  TAR: ['chapter'],
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

export const links = [
  // { name: 'Home', href: '/', children: [] },
  // { name: 'About', href: '/about', children: [] },
  {
      name: 'Westminster Standards',
      href: '/?search=westminster%20standards',
      children: [
          { name: 'Westminster Confession of Faith (WCF)', href: '/?search=WCF' },
          { name: 'Westminster Shorter Catechism (WSC)', href: '/?search=WSC' },
          { name: 'Westminster Larger Catechism (WLC)', href: '/?search=WLC' },
      ],
  },
  {
      name: 'Three Forms of Unity',
      href: '/?search=three%20forms%20of%20unity',
      children: [
          { name: 'The Belgic Confession of Faith (BCF)', href: '/?search=BCF' },
          { name: 'The Heidelberg Catechism (HC)', href: '/?search=HC' },
          { name: 'The Canons of Dort (CD)', href: '/?search=CD' },
      ],
  },
  {
      name: 'Other',
      href: null,
      children: [
          { name: 'Thirty Nine Articles (TAR)', href: '/?search=TAR' },
          { name: 'Six Forms of Unity', href: '/?search=six%20forms%20of%20unity' },
          { name: 'Ninety Five Theses', href: '/?search=95t' },
      ]
  },
  {
    name: 'Scripture Citation',
    href: null,
    children: [
      { name: 'Acts 2:42', href: '/?search=Acts+2%3A42' },
      { name: 'Matthew 28:19-20', href: '/?search=Matthew+28%3A19' },
      { name: 'John 10:28', href: '/?search=John+10%3A28' },    
    ]
  },
  {
    name: 'Keyword Search',
    href: null,
    children: [
      { name: 'WCF on Baptism', href: '/?search=wcf+baptism' },
      { name: 'HC on Providence', href: '/?search=HC+Providence' },
      { name: 'WLC on Preaching', href: '/?search=WLC+Preaching' },    
    ]
  },
  {
    name: 'Scripture Text',
    href: null,
    children: [
      { name: '"No one will snatch them"', href: '/?search=no+one+will+snatch+them' },
      { name: '"And they devoted themselves"', href: '/?search=And+they+devoted+themselves' },
      { name: '"Go, therefore, and make disciples"', href: '/?search=Go+therefore+and+make+disciples' },    
    ]
  },
  {
    name: 'Resources',
    href: null,
    children: [
      {
        name: 'Blog',
        href: 'https://blog.confessionalchristianity.com',
      },
      {
        name: 'About',
        href: 'https://www.confessionalchristianity.com/about',
      },
      {
        name: 'Church Finder',
        href: 'https://www.naparcsearch.com/',
      },
    ],
  }
];