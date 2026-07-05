/* eslint-disable react/prop-types */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Element styling is applied here (rather than via a typography plugin) so
// rendered markdown matches the app's manual-Tailwind styling elsewhere.
const components = {
  h2: ({ node, ...props }) => <h2 className="text-2xl lg:text-3xl mt-10 mb-3" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl lg:text-2xl mt-8 mb-2" {...props} />,
  p: ({ node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-4" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-4" {...props} />,
  li: ({ node, ...props }) => <li className="my-1 leading-relaxed" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 pl-4 italic my-6 text-gray-700" {...props} />
  ),
  a: ({ node, ...props }) => <a className="underline" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
};

const Commentary = ({ commentary }) => {
  if (!commentary) return null;
  const {
    title, subtitle, author, date, body,
  } = commentary;

  return (
    <article className="commentary w-full lg:w-1/2 mx-auto mb-24 pt-12 border-t">
      {title && <h2 className="text-3xl lg:text-4xl mb-2">{title}</h2>}
      {subtitle && <p className="text-xl text-gray-600 mb-2">{subtitle}</p>}
      {(author || date) && (
        <p className="text-sm text-gray-500 mb-8">
          {[author, date].filter(Boolean).join(' · ')}
        </p>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </article>
  );
};

export default Commentary;
