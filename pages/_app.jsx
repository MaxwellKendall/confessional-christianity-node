/* eslint-disable react/prop-types */
// import App from 'next/app';
import React from 'react';
import Head from 'next/head';
import { config } from '@fortawesome/fontawesome-svg-core';
// Import the CSS
import '@fortawesome/fontawesome-svg-core/styles.css';
import '../styles/index.scss';
import { AuthProvider } from '../context/AuthContext';

config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cinzel+Decorative&family=Marcellus&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
