// Small reusable labelled field wrapper for inputs / selects / textareas.
export function Field({ label, htmlFor, required, error, children, hint }) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={htmlFor}>
          {label} {required && <span className="required" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="file-hint">{hint}</span>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default Field;
