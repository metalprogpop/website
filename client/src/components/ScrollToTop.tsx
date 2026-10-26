import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// New pages start at the top; a link to a section (/#listen) lands on it,
// from any page and also when clicked again on the same one.
export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  // Only section links re-scroll on every navigation, so a page updating its
  // own query string (a filter) keeps its scroll position.
  const sectionVisit = hash ? key : null;

  useLayoutEffect(() => {
    const target = hash
      ? document.getElementById(decodeURIComponent(hash.slice(1)))
      : null;
    if (target) {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, sectionVisit]);

  return null;
}
