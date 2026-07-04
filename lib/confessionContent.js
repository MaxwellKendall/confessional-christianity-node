import path from 'path';
import { promises } from 'fs';

import { confessionPathByName } from '../dataMapping';

// Loads a single confession/catechism's content from its normalized JSON file
// and keys it by id, same shape as pages/[confession].jsx has always built inline.
export const loadConfessionContent = async (slug) => {
  const pathToConfession = confessionPathByName[slug];
  if (!pathToConfession) return null;

  const fileContents = await promises.readFile(path.join(process.cwd(), pathToConfession), 'utf8');
  const parsed = JSON.parse(fileContents);
  const contentById = parsed.content.reduce((asObj, obj) => ({
    ...asObj,
    [obj.id]: obj,
  }), {});

  // the canonical document id (e.g. WSC, WCoF) is derived from any entry
  // whose parent is the document itself (parent has no dash).
  const documentId = Object
    .entries(contentById)
    .find(([, v]) => v.parent.split('-').length === 1)[1].parent;

  return { contentById, documentId };
};
