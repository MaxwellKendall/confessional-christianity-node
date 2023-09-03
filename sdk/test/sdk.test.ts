/* eslint-disable no-unused-expressions */
/* global describe it */
import { expect } from 'chai';
import Sdk from '../src';

const client = new Sdk({ test: true });

describe('sdk', () => {
    const tests = [
        { input: 'westminster confession of faith', output: 'WCF' },
        { input: 'westminster confession of faith', output: 'WCF' },
        { input: 'westminster confession of faith', output: 'WCF' },
        { input: 'westminster confession of faith', output: 'WCF' },
        { input: 'westminster confession of faith', output: 'WCF' },
    ]
    tests.forEach(({ input, output }) => {
        it(`returns ${input} as ${output}`, () => {
            const result = client.parseSearch(input);
            expect(result).to.equal(output);
            }
        )
    })
})