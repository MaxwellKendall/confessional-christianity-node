import { startCase } from 'lodash';
import Link from "next/link";

import {
    removeJsonExtension,
    getConfessions
} from "../helpers/index";
import Blog from "../blog/test.mdx";

import '../styles/index.scss';

export async function getStaticProps(context) {
    // will be passed to the page component as props
    const confessions = await getConfessions();
    return {
        props: {
            confessions
        }
    };
};

const HomePage = ({
    confessions
}) => {
    return (
        <div className="home">
            <h1 className="text-center">Confessional Christianity</h1>
            <ul>
                {confessions.map((confession) => {
                    return (
                        <li>
                            <h2>{startCase(confession.folder)}</h2>
                            <ul>
                                {confession.contents.map((confession) => {
                                    const parsedConfession = confession.replace(removeJsonExtension, '');
                                    return (
                                        <li>
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
