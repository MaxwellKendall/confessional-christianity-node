import React from 'react';
import Link from 'next/link';
import { uniqueId } from 'lodash';
import { useRouter } from 'next/router';
import { links } from '../dataMapping';

const Footer = () => {
  const router = useRouter();
  const search = ('search' in router.query) ? router.query.search : '';
  console.log('search', search);

  return (
    <>
      <hr className="my-12" />
      <footer className="w-full">
        <p className="w-full text-center">Search the historic reformed confessions via keyword, text of Scripture, or Scripture citation.</p>
        <ul className="flex w-full margin-auto flex-wrap justify-center">
          {links.map((l) => {
            if (l.children.length) {
              return (
                <li key={uniqueId()} className="pt-10 list-none flex flex-col w-full md:w-1/3 items-center">
                  {l.href && (
                    <Link href={l.href}>
                      <span className="cursor-pointer text-center mt-5 w-full text-lg font-bold uppercase tracking-widest">{l.name}</span>
                    </Link>
                  )}
                  {!l.href && <span className="text-center w-full text-lg font-bold uppercase tracking-widest">{l.name}</span>}
                  <ul>
                    {l.children.map((child) => (
                      <li>
                        <Link href={child.href}>
                          <span className="cursor-pointer text-center mt-5 w-full text-sm">{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            return (
              <li key={uniqueId()} className="list-none pt-10 mx-4">
                <Link href={l.href}>
                  <span className="cursor-pointer text-center mt-5 w-full text-sm">{l.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="w-full text-center mt-24 text-sm uppercase">Soli Deo Gloria!</p>
      </footer>
    </>
  );
};

export default Footer;
