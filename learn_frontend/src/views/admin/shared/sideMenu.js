import React from 'react';
import navMenu from '../../../helpers/navMenu';
import { useLocation } from 'react-router-dom';

function SideMenu(props){
    const location = useLocation();

    const renderSideMenu = () =>{
        return (
            <div id="admin-menu" className="panel panel-default">
                {
                    navMenu.sidebar.filter(sidebar => sidebar.adminLevel <= props.adminLevel).map((side, idx)=>{
                        return(
                            <div key={idx}>
                            <div className="panel-heading"><strong>{side.txtNameBold}</strong> {side.txtNameRegular}</div>
                                {side.dropdown ?
                                        <div className="list-group"> 
                                            {side.dropdownMenu.filter(list => list.adminLevel <= props.adminLevel).map((dropdownList, idxDropdown)=>{
                                                if(dropdownList.dropdown){
                                                    return(
                                                        null
                                                    )
                                                }else{
                                                    return(
                                                        <a className={location.pathname===dropdownList.href? "active list-group-item": "list-group-item"} href={dropdownList.href} key={idxDropdown}>
                                                            <i className={dropdownList.iconClass}></i><span>&nbsp;{dropdownList.txtNameRegular}</span>
                                                        </a>
                                                    )                                            
                                                }
                                            })}
                                        </div>
                                    :
                                    null     
                                }
                            </div>
                        )
                })
                }
                <br/>
            </div>
        )
    }
    return(
        <div className="col-md-3">
            <style>
                {`
                .list-group {
                    padding-left: 0;
                    margin-bottom: 0px;                
                }
                `}
            </style>
            {renderSideMenu()}
        </div>
    )
}

export default SideMenu;