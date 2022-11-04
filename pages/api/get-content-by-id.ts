import path from "path";
import { promises as fs } from "fs";
import { confessionPathByName } from "../../dataMapping";
import { groupBy } from "lodash";

export default async function handler(req, res) {
  const contentById = await Object.entries(confessionPathByName).reduce(
    (prevPromise, [, value]) =>
      prevPromise.then(async (acc) => {
        const pathToConfession = path.join(process.cwd(), value);
        const fileContents = await fs.readFile(pathToConfession, "utf8");
        const parsed = JSON.parse(fileContents);
        const asObject = parsed.content.reduce(
          (asObj, obj) => ({
            ...asObj,
            [obj.id]: obj,
          }),
          {}
        );
        return Promise.resolve({
          ...acc,
          ...asObject,
        });
      }),
    Promise.resolve({})
  );

  const chaptersById = groupBy(
    Object.entries(contentById)
      .filter(([k]) => k.includes("-"))
      .reduce((acc, [, value]) => acc.concat([value]), []),
    (obj) => obj.parent
  );
  res.status(200).json({ chaptersById, contentById });
}
