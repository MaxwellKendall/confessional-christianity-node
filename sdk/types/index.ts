export enum DocumentIds {
    NINETY_FIVE_THESES = '95T',
    BELGIC_CONFESSION_OF_FAITH = 'BCF',
    CANONS_OF_DORDT = 'CD',
    HEIDELBERG_CATECHISM = 'HC',
    THIRTY_NINE_ARTICLES = 'TAR',
    WESTMINSTER_CONFESSION_OF_FAITH = 'WCF',
    WESTMINSTER_LARGER_CATECHISM = 'WLC',
    WESTMINSTER_SHORTER_CATECHISM = 'WSC',
}

export interface Content {
    title: string;
    text?: string;
    verses?: Record<string, string[]>;
    isParent?: boolean;
    parent?: string;
    number: number;
}

export enum AlgoliaIds {
    NINETY_FIVE_THESES = 'ML9t',
    BELGIC_CONFESSION_OF_FAITH = 'TBCoF',
    CANONS_OF_DORDT = 'CoD',
    HEIDELBERG_CATECHISM = 'HC',
    THIRTY_NINE_ARTICLES = 'TAoR',
    WESTMINSTER_CONFESSION_OF_FAITH = 'WCoF',
    WESTMINSTER_LARGER_CATECHISM = 'WLC',
    WESTMINSTER_SHORTER_CATECHISM = 'WSC',
}

export interface Config {
    algolia: {
        publicKey: string;
        secretKey: string;
    }
    indecies: Record<string, { name: string, hitsPerPage: number, attributesToHighlight: string[] }>
}

export interface Query {
  facets: string | undefined;
  q: string | undefined
}

/**
 * Algolia Types
 */

// Pt. I: Response Types
interface AlgoliaResult {
    fullyHighlighted: false;
    matchLevel: string;
    matchedWords: string[];
    value: string;
}

interface AggregateIndexResult {
    document: string;
    id: string;
    isParent: boolean;
    number: number;
    objectID: string;
    parent: string;
    text: string;
    title: string;
    verses?: Record<string, string[]> // { a: [Rom.1.19-Rom.1.20]} 
    _highlightResult: {
        text: AlgoliaResult;
        title: AlgoliaResult;
    }
}

interface BibleVersesIndexResult extends AlgoliaResult {
    bibleText: string;
    citation: string;
    citedBy: string[];
    id: string;
    objectID: string;
    _highlightResult: {
        bibleText: AlgoliaResult;
        citation: AlgoliaResult;
    }
}

interface AlgoliaRow<DataType> {
    exhaustive: {
        nbHits: boolean
    };
    exhaustiveNbHits: boolean;
    hits: DataType[];
    nbHits: number;
    nbPages: number;
    hitsPerPage: number;
}

export interface AlgoliaResponse {
    results: AlgoliaRow<BibleVersesIndexResult>[] | AlgoliaRow<AggregateIndexResult>[]
}

// Pt. II: Request Types
export interface AlgoliaIndexRequest {
    facetFilters?: string[];
    indexName: string;
    page: number;
    params: {
        attributesToHighlight: string[];
        hitsPerPage: number;
    }
    query: string;
}

// Algolia Types end