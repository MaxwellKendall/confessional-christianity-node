# What is the SDK?

The intent of the SDK is to centralize all of the logic associated with (a) parsing user search input and (b) returning accurate data.

Here are some requirements:

1. Given user input, parse search
2. Given a parsed search, use the appropriate source of truth 

Here is what is not in scope

1. Fetching data from the ESV API
## Examples
**Requirement #1: Parse User Search**
```javascript
    const { facets, q } = sdk.parseSearch('westminster confession of faith baptism')
    // { facets: ['WCF'], q: 'baptism' })
    const { facets, q } = sdk.parseSearch('psalms')
    // { facets: ['Psalms']}
    const { facets, q } = sdk.parseSearch('wcf psalms')
    // { facets: ['WCF', 'Psalms']}
```

**Requirement #2: Use Appropriate Source of Truth**
```javascript
    const { facets, q } = sdk.search('westminster confession of faith baptism')
    // call algolia
    const { facets, q } = sdk.search('wcf.1.2')
    // use JSON
```

## Local Development
Environment Variables Needed:
```shell
export NODE_OPTIONS="--loader ts-node/esm"
```