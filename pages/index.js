import { useState } from 'react';
import { startCase } from 'lodash';
import Link from "next/link";
import cx from "classnames";
import util from 'util';
import fs from 'fs';

import { removeJsonExtension } from "../helpers/index";
import Blog from "../blog/test.mdx";

import '../styles/index.scss';

export async function getStaticProps(context) {
    // will be passed to the page component as props
    const readDir = util.promisify(fs.readdir);
    const folders = await readDir("./data/");
    const confessions = await Promise.all(
        folders.map(async (folder) => {
            const contents = await readDir(`./data/${folder}`);
            return Promise.resolve({
                folder,
                contents
            });
        })
    );
    return {
        props: {
            confessions
        }
    };
};

const HomePage = ({
    confessions
}) => {
    const [expanded, setExpanded] = useState([]);
    
    const toggleFolder = (e, folder) => {
        e.preventDefault();
        
        if (expanded.includes(folder)) {
            setExpanded(expanded.filter((expandedFolder) => expandedFolder !== folder));
        }
        else {
            setExpanded([...expanded, folder])
        }
    };

    return (
        <div className="home flex flex-col p-8">
            <h1 className="text-center text-5xl">Confessional Christianity</h1>
            <ul className="flex w-2/4 self-center justify-center px-12 items-center flex-wrap relative">
                {confessions.map((confession) => {
                    const clickHandler = (e) => toggleFolder(e, confession.folder);
                    return (
                        <li className="p-10 hover:cursor-pointer" onClick={clickHandler}>
                            <h2 className="text-xl">{startCase(confession.folder)}</h2>
                            <ul className={cx('absolute', { hidden: !expanded.includes(confession.folder) })}>
                                {confession.contents.map((confession) => {
                                    const parsedConfession = confession.replace(removeJsonExtension, '');
                                    return (
                                        <li className="">
                                            <Link
                                                href="/confession/[confession]"
                                                as={`/confession/${parsedConfession}`}>
                                                {startCase(parsedConfession)}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </li>
                    );
                })}
            </ul>
            <Blog />
        </div>
    );
}

export default HomePage;
