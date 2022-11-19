Things I want:

1. Consistent Data Model
- right now, we dont have much of a consistent model; rather, we have different "classes" of data which each have their own schema
- We also have various kinds of IDs which all refer to the same document; for example, WCoF vs WCF, BCF vs TBCoF and so on.

2. Intuitive Helper Functions
- With a consistent data model, we can begin to have a consistent implementation of traversing that model.

3. Only use Algolia for search

Proposed:

```json
"[
    {
        title: 'XYZ',
        id: '',        
        parent: '',
        text: '',
        verses: {}
    }
]"
```