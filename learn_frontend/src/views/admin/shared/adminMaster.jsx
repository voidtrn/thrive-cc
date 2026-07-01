import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Head from '../../../components/head';
import routeAll from '../../../helpers/route';
import NavMenu from './navMenu';
import SideMenu from './sideMenu';
import Footer from '../../user/shared/footer';

const routeAllAdmin = { ...routeAll.routesAdmin, ...(routeAll.routesReport || {}) };

function LayoutAdmin(props) {
    const location = useLocation();

    if (Object.values(routeAllAdmin).findIndex(list => list.path === location.pathname) < 0) {
        return <Navigate to={routeAll.routesComponent?.notFound?.path || '/not-found'} replace/>;
    }

    const currentRoute = Object.values(routeAllAdmin).find(list => list.path === location.pathname);
    if (currentRoute.adminLevel <= props.adminLevel) {
        return <>{props.children}</>;
    }

    localStorage.setItem('previous_path', location.pathname);
    return <Navigate to={routeAll.routesComponent?.accessDenied?.path || '/access-denied'} replace/>;
}

export default LayoutAdmin;
