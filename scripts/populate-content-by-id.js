import path from 'path';
import { promises as fs } from 'fs';
import { groupBy } from 'lodash';
// import { confessionPathByName } from '../dataMapping';

const confessionPathByName = {
  'westminster-confession-of-faith': 'normalized-data/westminster/wcf.json',
  'westminster-larger-catechism': 'normalized-data/westminster/wlc.json',
  'westminster-shorter-catechism': 'normalized-data/westminster/wsc.json',
  'heidelberg-catechism':
    'normalized-data/three-forms-of-unity/heidelberg-catechism.json',
  'canons-of-dort': 'normalized-data/three-forms-of-unity/canons-of-dort.json',
  'the-belgic-confession-of-faith':
    'normalized-data/three-forms-of-unity/belgic-confession.json',
  'thirty-nine-articles-of-religion':
    'normalized-data/anglican/39-articles.json',
  'martin-luthers-95-theses': 'normalized-data/reformation/95-theses.json',
};
const main = async () => {
  const contentById = await Object.entries(confessionPathByName).reduce(
    (prevPromise, [, value]) => prevPromise.then(async (acc) => {
      const pathToConfession = path.resolve(__dirname, `../${value}`);
      const fileContents = await fs.readFile(pathToConfession, 'utf8');
      const parsed = JSON.parse(fileContents);
      const confessionId = parsed.title.split(' ').map((s) => s[0]).join('');
      const asObject = parsed.content
        .sort((a, b) => {
          // if (a.id.length > b.id.length) return -1;
          // if (b.id.length > a.id.length) return 1;
          if (!a.isParent && b.isParent) return -1;
          if (!b.isParent && a.isParent) return 1;
          return 0;
        })
        .reduce(
          (asObj, obj) => {
            // const shouldUpdateParent = !obj.children;
            // if (shouldUpdateParent) {
            //   const existingParentEntry = asObj[obj.parent] || { isParent: true, children: [] };
            //   const root = asObj[confessionId] || {
            //     text: parsed.title,
            //     id: confessionId,
            //     isParent: true,
            //     children: [],
            //   };
            //   return {
            //     [confessionId]: {
            //       ...root,
            //       children: root.children,
            //     },
            //   };
            // }
            const existingParentEntry = asObj[obj.parent] || { isParent: true, children: [] };
            const existingEntry = asObj[obj.id] || {};
            return {
              ...asObj,
              [obj.id]: {
                ...existingEntry,
                ...obj,
              },
              [obj.parent]: {
                ...existingParentEntry,
                children: existingParentEntry.children.concat([obj.id]).sort((a, b) => {
                  if (b.length > a.length) return -1;
                  if (a.length > b.length) return 1;
                  return 0;
                }),
              },
            };
          }, {},
        );
      asObject[confessionId] = {
        ...asObject[confessionId],
        text: parsed.title,
        id: confessionId,
        isParent: true,
      };

      return Promise.resolve({
        ...acc,
        ...asObject,
      });
    }),
    Promise.resolve({}),
  );

  const chaptersById = groupBy(
    Object.entries(contentById)
      .filter(([k]) => k.includes('-'))
      .reduce((acc, [, value]) => acc.concat([value]), []),
    (obj) => obj.parent,
  );
  await fs.writeFile(
    path.resolve(__dirname, '../dataMapping/content-by-id.json'),
    JSON.stringify(contentById),
  );
  await fs.writeFile(
    path.resolve(__dirname, '../dataMapping/chapters-by-id.json'),
    JSON.stringify(chaptersById),
  );

  console.info('done');
};

main();
