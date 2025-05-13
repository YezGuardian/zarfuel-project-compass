import React from 'react';
import { cn } from '@/lib/utils';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'blockquote' | 'list' | 'inline-code' | 'lead';
  as?: React.ElementType;
}

export const Typography = ({
  variant = 'p',
  as,
  className,
  children,
  ...props
}: TypographyProps) => {
  const Element = as || (variant === 'h1' ? 'h1' : 
                         variant === 'h2' ? 'h2' : 
                         variant === 'h3' ? 'h3' : 
                         variant === 'h4' ? 'h4' : 
                         variant === 'h5' ? 'h5' :
                         variant === 'h6' ? 'h6' :
                         variant === 'blockquote' ? 'blockquote' :
                         variant === 'list' ? 'ul' :
                         variant === 'inline-code' ? 'code' : 'p');
  
  const styles = cn(
    // Base styles
    'text-foreground',
    
    // Variant-specific styles
    variant === 'h1' && 'text-3xl font-bold tracking-tight text-foreground',
    variant === 'h2' && 'text-2xl font-bold tracking-tight text-foreground',
    variant === 'h3' && 'text-xl font-bold tracking-tight text-foreground',
    variant === 'h4' && 'text-lg font-semibold tracking-tight text-foreground',
    variant === 'h5' && 'text-base font-semibold tracking-tight text-foreground',
    variant === 'h6' && 'text-sm font-semibold tracking-tight text-foreground',
    variant === 'p' && 'leading-7',
    variant === 'blockquote' && 'mt-6 border-l-2 pl-6 italic',
    variant === 'inline-code' && 'rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
    variant === 'lead' && 'text-xl text-muted-foreground',
    variant === 'list' && 'my-6 ml-6 list-disc [&>li]:mt-2',
    
    // Custom class
    className
  );

  return (
    <Element className={styles} {...props}>
      {children}
    </Element>
  );
};

export const H1 = (props: TypographyProps) => <Typography variant="h1" {...props} />;
export const H2 = (props: TypographyProps) => <Typography variant="h2" {...props} />;
export const H3 = (props: TypographyProps) => <Typography variant="h3" {...props} />;
export const H4 = (props: TypographyProps) => <Typography variant="h4" {...props} />;
export const H5 = (props: TypographyProps) => <Typography variant="h5" {...props} />;
export const H6 = (props: TypographyProps) => <Typography variant="h6" {...props} />;
export const Paragraph = (props: TypographyProps) => <Typography variant="p" {...props} />;
export const Blockquote = (props: TypographyProps) => <Typography variant="blockquote" {...props} />;
export const InlineCode = (props: TypographyProps) => <Typography variant="inline-code" {...props} />;
export const Lead = (props: TypographyProps) => <Typography variant="lead" {...props} />;
export const List = (props: TypographyProps) => <Typography variant="list" {...props} />; 