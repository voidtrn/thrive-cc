import React, {
  Suspense, useEffect, useState
} from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import routeAll from './helpers/route';
import Layout from './views/user/shared/master';
import LayoutAdmin from './views/admin/shared/adminMaster';
import { LoadingPage } from './components/Loading';
import { securityData } from './helpers/globalHelper';

function App(props) {
  const adminLevelDatabase = props.adminLevel;

  useEffect(() => {
    if (securityData.Security_getPlatformId()) {
      redirectNotFound();
    }
  }, []);

  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const showLoading = (val) => {
    setLoading(val);
  };

  const getCurrentPathWithoutLastPart = () => {
    return location.pathname.slice(0, location.pathname.lastIndexOf('/'));
  };

  const redirectNotFound = () => {
    let allRoutePath = [];
    Object.values(routeAll).forEach((routeGroup) => {
      Object.values(routeGroup).forEach((v) => {
        allRoutePath.push(v.parentPath || v.path);
      });
    });

    let answer;
    if (getCurrentPathWithoutLastPart() === '/training_team') {
      answer = allRoutePath.includes(getCurrentPathWithoutLastPart());
    } else {
      answer = allRoutePath.includes(location.pathname);
    }

    if (!answer) {
      window.location.href = '/not-found';
    }
  };

  const commonProps = {
    adminLevel: adminLevelDatabase,
    loading: showLoading,
    setLoading,
  };

  const AdminLayoutWrapper = () => (
    <Suspense fallback={<LoadingPage loading={true}/>}>
      <LayoutAdmin {...commonProps}>
        <Outlet/>
      </LayoutAdmin>
    </Suspense>
  );

  const UserLayoutWrapper = () => (
    <Suspense fallback={<LoadingPage loading={true}/>}>
      <Layout
        {...commonProps}
        homePath={routeAll.routesUser.home.path}
      >
        <Outlet/>
      </Layout>
    </Suspense>
  );

  return (
    <Routes>
      {/* Admin routes — layout persists across navigations via Outlet */}
      <Route element={<AdminLayoutWrapper/>}>
        {Object.values(routeAll.routesAdmin).map((v, i) => (
          <Route
            key={i}
            path={v.path}
            element={
              <v.component
                pageName={v.pageName}
                adminLevel={adminLevelDatabase}
                name={v.name}
                loading={showLoading}
                setLoading={setLoading}
              />
            }
          />
        ))}
      </Route>

      {/* User routes — layout persists across navigations via Outlet */}
      <Route element={<UserLayoutWrapper/>}>
        {Object.values(routeAll.routesUser)
          .filter(list => list.adminLevel <= adminLevelDatabase)
          .map((v, i) => (
            <Route
              key={i}
              path={v.path}
              element={
                <v.component
                  pageName={v.pageName}
                  adminLevel={adminLevelDatabase}
                  name={v.name}
                  loading={showLoading}
                  setLoading={setLoading}
                />
              }
            />
          ))
        }
      </Route>
    </Routes>
  );
}

export default App;
