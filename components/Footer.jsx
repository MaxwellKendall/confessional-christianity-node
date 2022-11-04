import React from "react";
import Link from "next/link";

const Footer = ({
    links
}) => {
    return <>
        <hr className="my-12" />
        <footer className="flex flex-col w-full justify-center">
            {links.map((l) => {
                return (
                    <Link href={l.href} legacyBehavior>
                        <span className="cursor-pointer text-center mt-5 w-full text-xs">{l.link}</span>
                    </Link>
                );
            })}
    </footer>
    </>;
}

export default Footer;
