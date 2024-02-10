import { ESVApiByOsis, Osis, BibleBook, BibleBookByOsis, OsisByBibleBook } from "./types";

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

export const algoliaIdByDocumentId : Record<string, string>= {
  WCF: 'WCoF',
  HC: 'HC',
  WLC: 'WLC',
  WSC: 'WSC',
  CD: 'CoD',
  BCF: 'TBCoF',
  TAR: 'TAoR',
  '95T': 'ML9t',
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

export const bibleBookByAbbreviation : BibleBookByOsis = {
  Gen: BibleBook.Gen,
  Exod: BibleBook.Exod,
  Lev: BibleBook.Lev,
  Num: BibleBook.Num,
  Deut: BibleBook.Deut,
  Josh: BibleBook.Josh,
  Judg: BibleBook.Judg,
  Ruth: BibleBook.Ruth,
  '1Sam': BibleBook['1Sam'],
  '2Sam': BibleBook['2Sam'],
  '1Kgs': BibleBook['1Kgs'],
  '2Kgs': BibleBook['2Kgs'],
  '1Chr': BibleBook['1Chr'],
  '2Chr': BibleBook['2Chr'],
  Ezra: BibleBook.Ezra,
  Neh: BibleBook.Neh,
  Esth: BibleBook.Esth,
  Job: BibleBook.Job,
  Ps: BibleBook.Ps,
  Prov: BibleBook.Prov,
  Eccl: BibleBook.Eccl,
  Song: BibleBook.Song,
  Isa: BibleBook.Isa,
  Jer: BibleBook.Jer,
  Lam: BibleBook.Lam,
  Ezek: BibleBook.Ezek,
  Dan: BibleBook.Dan,
  Hos: BibleBook.Hos,
  Joel: BibleBook.Joel,
  Amos: BibleBook.Amos,
  Obad: BibleBook.Obad,
  Jonah: BibleBook.Jonah,
  Mic: BibleBook.Mic,
  Nah: BibleBook.Nah,
  Hab: BibleBook.Hab,
  Zeph: BibleBook.Zeph,
  Hag: BibleBook.Hag,
  Zech: BibleBook.Zech,
  Mal: BibleBook.Mal,
  Matt: BibleBook.Matt,
  Mark: BibleBook.Mark,
  Luke: BibleBook.Luke,
  John: BibleBook.John,
  Acts: BibleBook.Acts,
  Rom: BibleBook.Rom,
  '1Cor': BibleBook['1Cor'],
  '2Cor': BibleBook['2Cor'],
  Gal: BibleBook.Gal,
  Eph: BibleBook.Eph,
  Phil: BibleBook.Phil,
  Col: BibleBook.Col,
  '1Thess': BibleBook['1Thess'],
  '2Thess': BibleBook['2Thess'],
  '1Tim': BibleBook['1Tim'],
  '2Tim': BibleBook['2Tim'],
  Titus: BibleBook.Titus,
  Phlm: BibleBook.Phlm,
  Heb: BibleBook.Heb,
  Jas: BibleBook.Jas,
  '1Pet': BibleBook['1Pet'],
  '2Pet': BibleBook['2Pet'],
  '1John': BibleBook['1John'],
  '2John': BibleBook['2John'],
  '3John': BibleBook['3John'],
  Jude: BibleBook.Jude,
  Rev: BibleBook.Rev,
};

export const bibleApiAbbrByOsis: Record<Osis, ESVApiByOsis> = {
  Gen: ESVApiByOsis.Gen,
  Exod: ESVApiByOsis.Exod,
  Lev: ESVApiByOsis.Lev,
  Num: ESVApiByOsis.Num,
  Deut: ESVApiByOsis.Deut,
  Josh: ESVApiByOsis.Josh,
  Judg: ESVApiByOsis.Judg,
  Ruth: ESVApiByOsis.Ruth,
  '1Sam': ESVApiByOsis['1Sam'],
  '2Sam': ESVApiByOsis['2Sam'],
  '1Kgs': ESVApiByOsis['1Kgs'],
  '2Kgs': ESVApiByOsis['2Kgs'],
  '1Chr': ESVApiByOsis['1Chr'],
  '2Chr': ESVApiByOsis['2Chr'],
  Ezra: ESVApiByOsis.Ezra,
  Neh: ESVApiByOsis.Neh,
  Esth: ESVApiByOsis.Esth,
  Job: ESVApiByOsis.Job,
  Ps: ESVApiByOsis.Ps,
  Prov: ESVApiByOsis.Prov,
  Eccl: ESVApiByOsis.Eccl,
  Song: ESVApiByOsis.Song,
  Isa: ESVApiByOsis.Isa,
  Jer: ESVApiByOsis.Jer,
  Lam: ESVApiByOsis.Lam,
  Ezek: ESVApiByOsis.Ezek,
  Dan: ESVApiByOsis.Dan,
  Hos: ESVApiByOsis.Hos,
  Joel: ESVApiByOsis.Joel,
  Amos: ESVApiByOsis.Amos,
  Obad: ESVApiByOsis.Obad,
  Jonah: ESVApiByOsis.Jonah,
  Mic: ESVApiByOsis.Mic,
  Nah: ESVApiByOsis.Nah,
  Hab: ESVApiByOsis.Hab,
  Zeph: ESVApiByOsis.Zeph,
  Hag: ESVApiByOsis.Hag,
  Zech: ESVApiByOsis.Zech,
  Mal: ESVApiByOsis.Mal,
  Matt: ESVApiByOsis.Matt,
  Mark: ESVApiByOsis.Mark,
  Luke: ESVApiByOsis.Luke,
  John: ESVApiByOsis.John,
  Acts: ESVApiByOsis.Acts,
  Rom: ESVApiByOsis.Rom,
  '1Cor': ESVApiByOsis['1Cor'],
  '2Cor': ESVApiByOsis['2Cor'],
  Gal: ESVApiByOsis.Gal,
  Eph: ESVApiByOsis.Eph,
  Phil: ESVApiByOsis.Phil,
  Col: ESVApiByOsis.Col,
  '1Thess': ESVApiByOsis['1Thess'],
  '2Thess': ESVApiByOsis['2Thess'],
  '1Tim': ESVApiByOsis['1Tim'],
  '2Tim': ESVApiByOsis['2Tim'],
  Titus: ESVApiByOsis.Titus,
  Phlm: ESVApiByOsis.Phlm,
  Heb: ESVApiByOsis.Heb,
  Jas: ESVApiByOsis.Jas,
  '1Pet': ESVApiByOsis['1Pet'],
  '2Pet': ESVApiByOsis['2Pet'],
  '1John': ESVApiByOsis['1John'],
  '2John': ESVApiByOsis['2John'],
  '3John': ESVApiByOsis['3John'],
  Jude: ESVApiByOsis.Jude,
  Rev: ESVApiByOsis.Rev,
};

export const osisByBibleBook = Object
  .entries(bibleBookByAbbreviation)
  .reduce((obj, [key, value]) => ({
    ...obj,
    [value.toLowerCase()]: key,
  }), {});