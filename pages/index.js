import React from 'react';

import wlc from "../data/westminster/wlc.json";
import Blog from "../blog/test.mdx";

import '../styles/index.scss';

export async function getStaticProps(context) {
    // will be passed to the page component as props
    return {
        props: {
            wlc
        }
    };
};

const HomePage = ({
    wlc
}) => {
    // console.log("data", wlc);
    return (
        <>
            <h1 className="text-center">Hello Guyz</h1>
            <Blog />
        </>
    );
}

export default HomePage;
