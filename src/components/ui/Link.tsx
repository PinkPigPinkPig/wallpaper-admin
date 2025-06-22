import React, { HTMLAttributes, PropsWithChildren, MouseEvent, useCallback } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

export type LinkProps = PropsWithChildren<NextLinkProps<unknown> & HTMLAttributes<HTMLAnchorElement>>;

export type TLinkHref = string;

const Link: React.FC<LinkProps> = ({ href, onClick, children, ...nextLinkProps }) => {
  const nextRouter = useRouter();

  const handleLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (onClick) {
        onClick(e);
      }

      nextRouter.push(href.toString() as TLinkHref);
    },
    [href, nextRouter, onClick],
  );

  return (
    <NextLink href={href} onClick={handleLinkClick} {...nextLinkProps}>
      {children}
    </NextLink>
  );
};

export default Link;
