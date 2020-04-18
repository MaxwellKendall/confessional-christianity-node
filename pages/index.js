import fs from 'fs';
import path from 'path';
import util from 'util';

import wlc from "../data/westminster/wlc.json";
import Blog from "../blog/test.mdx";

import '../styles/index.scss';

const readDir = util.promisify(fs.readdir);

const getData = async () => {
    const folders = await readDir("./data/");
    return Promise.all(
        folders.map(async (folder) => {
            const contents = await readDir(`./data/${folder}`);
            return Promise.resolve({
                folder,
                contents
            });
        })
    );
};

export async function getStaticProps(context) {
    // will be passed to the page component as props
    const confessions = await getData();
    return {
        props: {
            confessions
        }
    };
};

const HomePage = ({
    confessions
}) => {
    console.log(confessions);
    return (
        <div className="home">
            <h1 className="text-center">Confessional Christianity</h1>
            <ul>
                {confessions.map((confession) => {
                    return (
                        <li>
                            <span>{confession.folder}</span>
                            <ul>
                                {confession.contents.map((confession) => <li>{confession}</li>)}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default HomePage;
