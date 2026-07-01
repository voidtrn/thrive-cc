import React, { 
    // useState 
  } from 'react';
import { Redirect, useLocation } from 'react-router';
import Head from '../../../components/head';
import routeAll from '../../../helpers/route';
import NavMenu from './navMenu';
import SideMenu from './sideMenu';
import Footer from '../../user/shared/footer';

const routeAllAdmin = {...routeAll.routesAdmin, ...routeAll.routesReport}

function LayoutAdmin(props){
    const location = useLocation()

    if(Object.values(routeAllAdmin).findIndex(list => list.path === location.pathname) < 0){
        return(
            <Redirect to={routeAll.routesComponent.notFound.path} exact/>
        )
    }else{
        if(Object.values(routeAllAdmin).find(list => list.path === location.pathname).adminLevel <= props.adminLevel){
            //props.setLoading(false)
            
            //console.log(props.children);
            return(
                <>
                {props.children}
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