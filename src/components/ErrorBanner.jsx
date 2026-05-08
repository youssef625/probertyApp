import React from 'react';

const ErrorBanner = ({ messages = [], title, className = '' }) => {
  const items = Array.isArray(messages) ? messages.filter(Boolean) : [];
  if (items.length === 0) return null;

  return (
    <div className={`alert alert-error ${className}`.trim()}>
      <div>
        {title && <div className="font-semibold mb-1">{title}</div>}
        {items.length > 1 ? (
          <ul className="list-disc pl-5 space-y-1">
            {items.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        ) : (
          <span>{items[0]}</span>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
