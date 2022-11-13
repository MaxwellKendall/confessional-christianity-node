import React from "react";
import Link from "next/link";
import { uniqueId } from "lodash";

const links = [
    { name: 'Home', href: '/', children: [] },
    { name: 'About', href: '/about', children: [] },
    {
        name: 'Westminster Standards',
        href: '/?search=westminster%20standards',
        children: [
            { name: 'Westminster Confession of Faith', href: '/?search=WCF' },
            { name: 'Westminster Shorter Catechism', href: '/?search=WSC' },
            { name: 'Westminster Larger Catechism', href: '/?search=WLC' },
        ],
    },
    {
        name: 'Three forms of Unity',
        href: '/?search=three%forms',
        children: [
            { name: 'The Belgic Confession of Faith', href: '/?search=BCF' },
            { name: 'The Heidelberg Catechism', href: '/?search=HC' },
            { name: 'The Canons of Dort', href: '/?search=CD' },
        ],
    },
    {
        name: 'Other',
        href: '',
        children: [
            { name: 'Thirty Nine Articles', href: '/TAR' },
        ]
    }
];

const Footer = () => {
    return <>
        <hr className="my-12" />
        <footer className="flex flex-row w-full justify-center">
            {links.map((l) => {
                if (l.children.length) {
                    return (
                        <li key={uniqueId()} className="list-none flex flex-col">
                            <Link href={l.href}>
                                <span className="cursor-pointer text-center mt-5 w-full text-md">{l.name}</span>
                                <ul>
                                    {l.children.map((child) => {
                                        return (
                                            <li>
                                                <Link href={child.href}>
                                                    <span className="cursor-pointer text-center mt-5 w-full text-sm">{child.name}</span>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Link>
                        </li>
                    );
                }
                return (
                    <li key={uniqueId()} className="list-none mx-4">
                        <Link href={l.href}>
                            <span className="cursor-pointer text-center mt-5 w-full text-sm">{l.name}</span>
                        </Link>
                    </li>
                );
            })}
    </footer>
    </>;
}

export default Footer;
