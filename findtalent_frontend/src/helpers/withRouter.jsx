import { useNavigate, useParams, useLocation, useOutletContext } from 'react-router-dom';

/**
 * v5->v6 compatibility HOC for class components.
 * react-router v6 removed `withRouter` and stopped injecting match/location/history
 * props. This re-injects them via hooks so existing class components keep working:
 *
 *   - this.props.navigate        -> v6 navigate fn
 *   - this.props.params          -> useParams()
 *   - this.props.match.params    -> useParams() (v5 shape)
 *   - this.props.location        -> location, with any custom keys pushed via
 *                                    navigate state merged back to the top level
 *                                    (old code did history.push({pathname, data, state})
 *                                     and read this.props.location.data / .state)
 *   - this.props.history.push/replace/goBack -> navigate shims
 */
export default function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const navigate = useNavigate();
    const params = useParams();
    const rrLocation = useLocation();
    // Layout routes pass shared props (e.g. loadingData) via <Outlet context>.
    // Returns null when there is no Outlet ancestor, so it's safe everywhere.
    const outletContext = useOutletContext() || {};

    // v5 compat: custom keys (data, tab, ...) were pushed as part of the location
    // object and read straight off this.props.location. We stash the whole pushed
    // object in navigate state and merge it back here.
    const location = { ...rrLocation, ...(rrLocation.state || {}) };

    const history = {
      push: (to) =>
        to && typeof to === 'object'
          ? navigate(to.pathname, { state: to })
          : navigate(to),
      replace: (to) =>
        to && typeof to === 'object'
          ? navigate(to.pathname, { replace: true, state: to })
          : navigate(to, { replace: true }),
      goBack: () => navigate(-1),
    };

    return (
      <Component
        {...props}
        {...outletContext}
        navigate={navigate}
        params={params}
        match={{ params }}
        location={location}
        history={history}
      />
    );
  }
  return ComponentWithRouterProp;
}
