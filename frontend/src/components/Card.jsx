/**
 * Reusable Card Component
 * Consistent card styling with variants
 */

const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  role,
  ariaLabel
}) => {
  const baseStyles = 'rounded-2xl shadow-2xl flex flex-col';
  
  const variants = {
    default: 'bg-glossy-black-ultra backdrop-blur-xl ring-1 ring-white/5',
    elevated: 'bg-glossy-black backdrop-blur-xl ring-1 ring-white/10',
    bordered: 'bg-black/40 border border-emerald-500/20',
    gradient: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30',
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverClass = hover ? 'hover:ring-emerald-500/30 transition-all duration-300 hover-lift cursor-pointer' : '';
  
  const cardClasses = `${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverClass} ${className}`;
  
  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

export default Card;
