import { useNavigate } from 'react-router-dom';

export function useHistory() {
  const navigate = useNavigate();
  return {
    push: (to, state) => navigate(to, state !== undefined ? { state } : undefined),
    replace: (to, state) => navigate(to, { replace: true, ...(state !== undefined ? { state } : {}) }),
    go: (n) => navigate(n),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    listen: () => () => {},
  };
}
