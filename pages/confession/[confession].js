import {
    getConfessions,
    removeJsonExtension
} from "../../helpers";

const Confession = ({
    data
}) => {
    return `HEYO, ${data.name}`;
}

export async function getStaticPaths() {
    // import { getAvailableConfessions } from "../../helpers";
    const confessions = await getConfessions();
    return {
      ...confessions
        .reduce((acc, folder) => {
            return {
                ...acc,
                paths: [
                    ...acc.paths,
                    ...folder.contents
                        .map((confession) => ({
                            params: {
                                confession: confession.replace(removeJsonExtension, '')
                            }
                        }))
                ]
            }
        }, { paths: [] }),
      fallback: false,
    };
};

export async function getStaticProps(context) {
    const confessions = await getConfessions();
    const { confession } = context.params;
    const folder = confessions.find((folder) => {
        console.log("folder", folder, confession);
        return folder
            .contents
            .some((content) => content === `${confession}.json`)
    });
    const data = require(`../../data/${folder.folder}/${confession}.json`);
    return {
        props: {
            data
        }
    };
}

export default Confession;
