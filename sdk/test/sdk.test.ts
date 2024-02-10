/* eslint-disable no-unused-expressions */
/* global describe it */
import { expect } from 'chai';
import Sdk from '..';
import * as sinon from 'sinon';
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
    describe('parseUserQuery: interpret the facets', () => {
        const facets = [
            // basic
            { input: 'westminster confession of faith baptism', q: 'baptism', facets: 'WCF', skip:false },
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
            // // @TODO: search multiple confessions
            { skip: true, input: 'WSC WLC', q: undefined, facets: 'WSC,WLC' },
            // @TODO: support both lords day + direct questions also the questions
            { input: 'hc.120', q: undefined, facets: 'HC.120' },
            { input: 'hc.1.2', q: undefined, facets: 'HC.1.2' },
            { input: 'canons of dordt', q: undefined, facets: 'CD' },
            { input: 'CD.1', q: undefined, facets: 'CD.1' },
            { input: 'CD.1.1', q: undefined, facets: 'CD.1.1' },
            { input: 'CD.1.r1', q: undefined, facets: 'CD.1.r1' },
            { input: 'genesis', q: undefined, facets: 'Gen' },
            { input: 'genesis 3', q: undefined, facets: 'Gen.3' },
            { input: 'genesis 3:15', q: undefined, facets: 'Gen.3.15' },
            { input: 'genesis 3:15-17', q: undefined, facets: 'Gen.3.15-17'},
            { input: 'genesis 3:15-4:1', q: undefined, facets: 'Gen.3.15-4.1', skip: false },
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
    
    // describe('performSearch', () => {
    //     const spy = sinon.spy(client.client, 'multipleQueries');
    //     it('doesnt call algolia when no query exists', async () => {
    //         const { results } = await client.performSearch({ q: undefined, facets: 'WCF.1' });
    //         expect(results.length).to.equal(2);
    //         expect(spy.callCount).to.be.equal(0)
    //     });
    //     it('calls algolia when query exists', () => {
    //         client.performSearch({ q: 'baptism', facets: 'WCF' });
    //         expect(spy.callCount).to.be.equal(1)
    //     });
    // })
})
// describe('helpers', () => {
//     describe('fromFacetToAlgoliaFacet', () => {
//         const facets = [
//             { input: client.parseUserQuery('WCF.1.1'), result: 'id:WCoF-1-1'},
//             { input: client.parseUserQuery('WCF.1'), result: 'parent:WCoF-1'},
//             { input: client.parseUserQuery('WCF'), result: 'document:WCoF'},
//             { input: client.parseUserQuery('HC.1.1'), result: 'id:HC-1-1'},
//             { input: client.parseUserQuery('HC.1'), result: 'parent:HC-1'},
//             { input: client.parseUserQuery('HC'), result: 'document:HC'},
//             { input: client.parseUserQuery('WSC.1'), result: 'id:WSC-1'},
//             { input: client.parseUserQuery('WSC'), result: 'document:WSC'},
//             { input: client.parseUserQuery('WLC.1'), result: 'id:WLC-1'},
//             { input: client.parseUserQuery('WLC'), result: 'document:WLC'},
//             { input: client.parseUserQuery('BCF.1'), result: 'id:TBCoF-1'},
//             { input: client.parseUserQuery('BCF'), result: 'document:TBCoF'},
//             { input: client.parseUserQuery('CD'), result: 'document:CoD'},
//             { input: client.parseUserQuery('CD.1'), result: 'parent:CoD-1-articles,parent:CoD-1-rejections'},
//             { input: client.parseUserQuery('CD.1.r1'), result: 'id:CoD-1-rejections-1'},
//             { input: client.parseUserQuery('CD.1.1'), result: 'id:CoD-1-articles-1'},
//             { input: client.parseUserQuery('Gen'), result: 'book:Gen', skip: true },
//             { input: client.parseUserQuery('Gen.3'), result: ['book:Gen', 'startChapter:3'], skip: true },
//             { input: client.parseUserQuery('Gen.3.15'), result: ['book:Gen', 'startChapter:3', 'startVerse:15'], skip: true },
//             { input: client.parseUserQuery('Gen.3.15-4.1'), result: ['book:Gen', 'startChapter:3', 'startVerse:15', 'endChapter:4', 'endVerse:1'], skip: true },
//         ];
//         facets.forEach(({ input, result, skip }) => {
//             const description = `transforms ${input.facets} to ${result}`;
//             if (skip) {
//                 it.skip(`TODO: ${description}`)
//             } else {
//                 it(description, () => {
//                     expect(fromFacetToAlgoliaFacet(input)).to.equal(result);
//                 })
//             }
//         });
//     });
// })