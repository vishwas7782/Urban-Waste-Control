export default function Card({ children, className = '', hover = false, ...rest }) {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
