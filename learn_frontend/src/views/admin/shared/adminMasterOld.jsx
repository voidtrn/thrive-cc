import React, { 
    // useState 
  } from 'react';
import { Redirect, useLocation } from 'react-router';
import Head from '../../../components/head';
import routeAll from '../../../helpers/route';
import NavMenu from './navMenu';
import SideMenu from './sideMenu';

const routeAllAdmin = {...routeAll.routesAdmin, ...routeAll.routesReport}

function LayoutAdmin(props){
    const location = useLocation()

    if(Object.values(routeAllAdmin).findIndex(list => list.path === location.pathname) < 0){
        return(
            <Redirect to={routeAll.routesComponent.notFound.path} exact/>
        )
    }else{
        if(Object.values(routeAllAdmin).find(list => list.path === location.pathname).adminLevel <= props.adminLevel){
            props.setLoading(false)
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

                        .container {
                            max-width: 1200px;
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
            localStorage.setItem('previous_path', location.pathname)
            if(localStorage.getItem('previous_path')){
                return(
                    <Redirect to={routeAll.routesComponent.accessDenied.path} exact/>
                )
            }
            
        }
    }
}

export default LayoutAdmin;