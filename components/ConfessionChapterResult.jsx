/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { uniqueId } from 'lodash';

import ConfessionTextResult from './ConfessionTextResult';

const ConfessionChapterResult = ({
  title,
  data,
  contentById,
}) => (
  <li key={uniqueId()} className="w-full flex flex-col justify-center mb-24">
    <h3 className="text-3xl lg:text-4xl w-full text-center mb-24">{title}</h3>
    <ul>
      {data.map((d) => <ConfessionTextResult {...d} contentById={contentById} />)}
    </ul>
  </li>
);

export default ConfessionChapterResult;
