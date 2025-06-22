import React, { ReactNode } from 'react';
import styled from 'styled-components';

type TProps = {
  children: ReactNode;
};

export const GridContainer = styled.div<{ col: number }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, ${(p: { col: number }) => (p.col < 3 ? '350px' : '1fr')}));
  gap: 24px;
  width: 100%;
`;

const FilterContainer = ({ children }: TProps) => {
  return <GridContainer col={(children as Array<unknown>)?.length || 1}>{children}</GridContainer>;
};

export default FilterContainer;
