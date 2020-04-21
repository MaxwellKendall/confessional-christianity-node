import {
    getConfessions,
    removeJsonExtension
} from "../../helpers";

const Creed = (data) => {
    return (
        <div className="creed">
            <h1>{data.name}</h1>
            <p>{data.text}</p>
        </div>
    );
}

const Confession = (data) => {
    return (
        <div className="confession">
            <h1>{data.name}</h1>
            <span>{data.publication_year}</span>
            {data.chapters.map((chapter) => {
                const isElaborateConfession = Object.keys(chapter).includes('articles');
                return (
                    <div className="confession-chapter">
                        <h2>{`Chapter ${chapter.number}: ${chapter.name}`}</h2>
                        {!isElaborateConfession && <p>{chapter.text}</p>}
                        {isElaborateConfession && (
                            chapter.articles.map((article) => {
                                const includesVerses = Object.keys(article).includes('verses');
                                return (
                                    <div className="confession-chatper__article">
                                        <p>{article.text}</p>
                                        {includesVerses && Array.isArray(article.verses) && (
                                            article.verses.map((verse) => verse)
                                        )}
                                        {includesVerses && !Array.isArray(article.verses) && (
                                            Object.keys(article.verses)
                                                .map((citation) => (
                                                    <div className="scripture-citation">
                                                        <p>{`${citation}: ${article.verses[citation].map((verse) => verse)}`}</p>
                                                    </div>
                                            ))
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                );
            })}
        </div>
    )
}

const ConfessionalDocument = ({
    data
}) => {
    console.log("data", data);
    if (data.type === 'creed') {
        return (
            <Creed {...data} />
        );
    }

    if (data.type === 'confession') {
        return (
            <Confession {...data} />
        );
    }
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

export default ConfessionalDocument;
