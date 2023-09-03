import { parseFacets } from "../helpers/index.ts";

console.log('hello worldz')

interface Config {
    test: boolean;
}

interface SdkType {
    parseSearch: (input: string) => string[] | string[][]
}

class Abc implements SdkType {
    config: Config
    constructor(c: Config) {
      this.config = c;
    }
  
    parseSearch(input: string) {
      return parseFacets(input);
    }
  }


export default Abc;