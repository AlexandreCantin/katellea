import React from 'react';
import { BarChart } from 'react-d3-components';

import { useWidth } from '../../../hooks/use-width';
import { isArray } from 'util';

export const StatsBarGraph = ({ stats, title, fields }) => {

  const width = useWidth() * .75;

  var data = [];
  if(!isArray(fields)) fields = [fields];

  fields.forEach(field => data.push(
    { label: field, values: stats.map(stat => ({x: stat.dayString, y: stat[field] })) }
  ));

  return (
    <>
      <h4>{ title }</h4>
      <BarChart groupedBars data={data} width={width} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}} />
    </>
  );
};