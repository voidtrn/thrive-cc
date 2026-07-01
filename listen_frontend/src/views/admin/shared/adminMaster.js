import React, { 
    // useState 
  } from 'react';
import { Navigate, useLocation } from 'react-router';
import Head from '../../../components/head';
import routeAll from '../../../helpers/route';
import NavMenu from '../../user/shared/navMenu';
import SideMenu from './sideMenu';

const routeAllAdmin = {...routeAll.routesAdmin, ...routeAll.routesReport}

function LayoutAdmin(props){
    const location = useLocation()

    if(Object.values(routeAllAdmin).findIndex(list => list.path === location.pathname) < 0){
        return(
            <Navigate to={routeAll.routesComponent.notFound.path} exact/>
        )
    }else{
        if(Object.values(routeAllAdmin).find(list => list.path === location.pathname).adminLevel <= props.adminLevel){
            props.loading(false)
            return(
                <>
                <Head.HeadAdmin/>
                <NavMenu adminLevel={props.adminLevel} {...props}/>
                <br></br>
                <style>
                    {`
                        .grid-view img {
                            max-width: 100%;
                            width: inherit;
                            height: inherit;
                            /* width: 24px; */
                            /* height: 24px; */
                        }
                    `}
                </style>
                <div id="layout-content">
                    <div id="layout-content">
                        <div className="container">
                            <div className="row">
                                {Object.values(routeAll.routesAdmin).findIndex(list => list.path === location.pathname) < 0 ? 
                                    null
                                :
                                    <SideMenu adminLevel={props.adminLevel}/>
                                }
                                {props.children}
                            </div>
                        </div>
                    </div>
                </div>
                </>
            );
        }else{
            return(
                <Navigate to={routeAll.routesComponent.accessDenied.path} exact/>
            )
        }
    }
}

export default LayoutAdmin;