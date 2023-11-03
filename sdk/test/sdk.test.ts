/* eslint-disable no-unused-expressions */
/* global describe it */
import { expect } from 'chai';
import Sdk from '../src';
import sinon from 'sinon';
import { fromFacetToAlgoliaFacet } from '../helpers';
const MOCK_ALGOLIA = {
    algolia: {
        publicKey: '',
        secretKey: '',
    },
    indecies: [{ name: 'test', hitsPerPage: 20, attributesToHighlight: ['text'] }]
}

const client = new Sdk(MOCK_ALGOLIA);

describe('sdk', () => {
    describe('parseSearch: interpret the facets', () => {
        const facets = [
            // basic
            { input: 'westminster confession of faith baptism', q: 'baptism', facets: 'WCF' },
            { input: 'WCF.1.10 scripture', q: 'scripture', facets: 'WCF.1.10' },
            { input: 'westminster shorter catechism baptism', q: 'baptism', facets: 'WSC' },
            { input: 'WSC.1', q: undefined, facets: 'WSC.1' },
            { input: 'WSC.1 baptism', q: 'baptism', facets: 'WSC.1' },
            { input: 'westminster larger catechism', q: undefined, facets: 'WLC' },
            { input: 'WLC.56', q: undefined, facets: 'WLC.56' },
            { input: 'WLC.56 wicked men', q: 'wicked men', facets: 'WLC.56' },
            { input: 'belgic confession of faith', q: undefined, facets: 'BCF' },
            { input: 'BCF.10', q: undefined, facets: 'BCF.10' },
            { input: 'BCF.10 baptism', q: 'baptism', facets: 'BCF.10' },
            { input: 'heidelberg catechism', q: undefined, facets: 'HC' },
            // search multiple confessions
            { skip: true, input: 'WSC WLC', q: undefined, facets: 'WSC,WLC' },
            // @TODO: support both lords day + direct questions also the questions
            { input: 'hc.120', q: undefined, facets: 'HC.120' },
            { input: 'hc.1.2', q: undefined, facets: 'HC.1.2' },
            { input: 'canons of dordt', q: undefined, facets: 'CD' },
            { input: 'CD.1', q: undefined, facets: 'CD.1' },
            { input: 'CD.1.1', q: undefined, facets: 'CD.1.1' },
            { input: 'CD.1.r1', q: undefined, facets: 'CD.1.r1' },
            { input: 'genesis', q: undefined, facets: 'genesis', skip: true },
            { input: 'exodus', q: undefined, facets: 'exodus', skip: true },
            { input: 'leviticus', q: undefined, facets: 'leviticus', skip: true },
            { input: 'numbers', q: undefined, facets: 'numbers', skip: true },
            { input: 'deuteronomy', q: undefined, facets: 'deuteronomy', skip: true },
            { input: 'joshua', q: undefined, facets: 'joshua', skip: true },
            { input: 'judges', q: undefined, facets: 'judges', skip: true },
            { input: 'ruth', q: undefined, facets: 'ruth', skip: true },
            { input: '1 samuel', q: undefined, facets: '1 samuel', skip: true },
            { input: '2 samuel', q: undefined, facets: '2 samuel', skip: true },
        ]
        facets.forEach(({ input, ...expected }) => {
            const description = `returns ${input} facets and user query as: { facets: ${expected.facets}, q: ${expected.q} }`;
            if (expected.skip) {
                it.skip(description)
            } else {
                it(description, () => {
                    const { q, facets } = client.parseUserQuery(input);
                    expect(facets).to.equal(expected.facets);
                    expect(q).to.equal(expected.q)
                })
            }
        })
    });
    
    describe('performSearch', () => {
        const spy = sinon.spy(client.client, 'multipleQueries');
        it('doesnt call algolia when no quer exists', () => {
            const result = client.performSearch({ q: undefined, facets: 'WCF.1' });
            expect(result.length).to.equal(2);
            expect(spy.callCount).to.be.equal(0)
        });
        it('calls algolia when query exists', () => {
            client.performSearch({ q: 'baptism', facets: 'WCF' });
            expect(spy.callCount).to.be.equal(1)
        });
    })
})
describe('helpers', () => {
    describe('fromFacetToAlgoliaFacet', () => {
        const facets = [
            { input: client.parseUserQuery('WCF.1.1'), result: 'id:WCoF-1-1'},
            { input: client.parseUserQuery('WCF.1'), result: 'parent:WCoF-1'},
            { input: client.parseUserQuery('WCF'), result: 'document:WCoF'},
            { input: client.parseUserQuery('HC.1.1'), result: 'id:HC-1-1'},
            { input: client.parseUserQuery('HC.1'), result: 'parent:HC-1'},
            { input: client.parseUserQuery('HC'), result: 'document:HC'},
            { input: client.parseUserQuery('WSC.1'), result: 'id:WSC-1'},
            { input: client.parseUserQuery('WSC'), result: 'document:WSC'},
            { input: client.parseUserQuery('WLC.1'), result: 'id:WLC-1'},
            { input: client.parseUserQuery('WLC'), result: 'document:WLC'},
            { input: client.parseUserQuery('BCF.1'), result: 'id:TBCoF-1'},
            { input: client.parseUserQuery('BCF'), result: 'document:TBCoF'},
            { input: client.parseUserQuery('CD'), result: 'document:CoD'},
            { input: client.parseUserQuery('CD.1'), result: 'parent:CoD-1-articles,parent:CoD-1-rejections'},
            { input: client.parseUserQuery('CD.1.r1'), result: 'id:CoD-1-rejections-1'},
            { input: client.parseUserQuery('CD.1.1'), result: 'id:CoD-1-articles-1'},
        ];
        facets.forEach(test => {
            it(`transforms ${test.input.facets} to ${test.result}`, () => {
                expect(fromFacetToAlgoliaFacet(test.input)).to.equal(test.result);
            })
        });
    });
})