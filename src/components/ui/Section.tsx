import React, { CSSProperties, ReactNode } from 'react';

type TProps = {
  children: ReactNode;
  classNames?: string;
  style?: CSSProperties;
};

const Section = ({ children, classNames, style }: TProps) => {
  return (
    <div className={`p-6 bg-white ${classNames}`} style={style}>
      {children}
    </div>
  );
};

export default Section;
