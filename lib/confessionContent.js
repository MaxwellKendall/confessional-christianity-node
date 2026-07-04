import wcf from '../normalized-data/westminster/wcf.json';
import wlc from '../normalized-data/westminster/wlc.json';
import wsc from '../normalized-data/westminster/wsc.json';
import heidelbergCatechism from '../normalized-data/three-forms-of-unity/heidelberg-catechism.json';
import canonsOfDort from '../normalized-data/three-forms-of-unity/canons-of-dort.json';
import belgicConfession from '../normalized-data/three-forms-of-unity/belgic-confession.json';
import thirtyNineArticles from '../normalized-data/anglican/39-articles.json';
import ninetyFiveTheses from '../normalized-data/reformation/95-theses.json';

// Statically imported so webpack bundles the data directly into every function
// that needs it. Reading these files from disk at runtime (via fs) breaks in
// Vercel's serverless bundles because the dynamic read path isn't traced, which
// caused sitemap.xml (getServerSideProps) to 500 with ENOENT in production.
// Keys must match confessionPathByName in dataMapping.
const confessionDataByName = {
  'westminster-confession-of-faith': wcf,
  'westminster-larger-catechism': wlc,
  'westminster-shorter-catechism': wsc,
  'heidelberg-catechism': heidelbergCatechism,
  'canons-of-dort': canonsOfDort,
  'the-belgic-confession-of-faith': belgicConfession,
  'thirty-nine-articles-of-religion': thirtyNineArticles,
  'martin-luthers-95-theses': ninetyFiveTheses,
};

// Loads a single confession/catechism's content keyed by id, same shape as
// pages/[confession].jsx has always built inline.
export const loadConfessionContent = async (slug) => {
  const parsed = confessionDataByName[slug];
  if (!parsed) return null;

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
