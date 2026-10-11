/** Section heading used across the marketing and shop pages. */
export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="mb-8 flex flex-col gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-iris-300">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </header>
  );
}
