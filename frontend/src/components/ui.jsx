export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2';
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variants = {
    primary: 'bg-sage text-paper hover:bg-sage-dark',
    clay: 'bg-clay text-paper hover:bg-clay-dark',
    danger: 'bg-brick text-paper hover:bg-[#8f3a32]',
    ghost: 'bg-transparent text-ink hover:bg-paper-dim border border-line',
    subtle: 'bg-paper-dim text-ink hover:bg-line',
  };
  return (
    <button type={type} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-card border border-line rounded-card shadow-[0_1px_2px_rgba(27,42,47,0.04)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spinner({ label = 'Chargement…' }) {
  return (
    <div className="flex items-center gap-3 text-ink-soft py-8 justify-center">
      <span className="w-5 h-5 border-2 border-line border-t-sage rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-brick-light text-brick border border-brick/20 rounded-lg px-4 py-3 text-sm">
      <span aria-hidden="true" className="font-bold">⚠</span>
      <span>{message}</span>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-14 px-6">
      {icon && <div className="text-4xl mb-1 opacity-60">{icon}</div>}
      <p className="font-display text-lg text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink-soft max-w-sm">{subtitle}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function FieldLabel({ children }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft mb-1.5">{children}</label>;
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors ${props.className || ''}`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors resize-y ${props.className || ''}`}
    />
  );
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-sage focus:ring-1 focus:ring-sage outline-none transition-colors ${props.className || ''}`}
    />
  );
}
