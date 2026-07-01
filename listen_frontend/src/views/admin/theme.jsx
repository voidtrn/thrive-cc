import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useNavigate } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Theme Name
                    </th>
                    <th>
                        Language
                    </th>
                    <th style={{ width:"100px" }}>
                        Status
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td style={{ width:"30%" }}>{item.theme_name}</td>
                        <td> {item.lang} </td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active === 1 ? 'Active': 'Inactive'}</span>{item.default_flag===1 ? <div>( Default )</div> :null}</td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} >
                                <i className="fa fa-pencil-alt"></i> edit</a>
                            &nbsp;
                            {item.default_flag===0 ? 
                                <a className="btn btn-primary btn-xs tt" onClick={props.default.bind(this,item.id)} ><i className="fa fa-pencil-alt"></i>&nbsp; Set as Default</a>
                                : 
                                null
                            }
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Theme(props){
    const history = useNavigate()
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const platform_id = securityData.Security_getPlatformId()
    const [loading, setLoading] = useState(true)
    const pageRangeDisplayed = 10
    const limit = 5

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id: platform_id
        };

        let isi = await axiosLibrary.postData('dialogueTheme/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id: platform_id
        };

        let isi = await axiosLibrary.postData('dialogueTheme/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[offset,getTotalPage])

    useEffect(()=>{
        getData()
    },[getData])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history({
            pathname: routeAdmin.themeDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const goTo = () => {
        if(totalData >= 2){
            alert("you have reached the maximum limit in creating the theme, maximum limit: 2")
            return false
        }

        history({
            pathname: routeAdmin.themeDetail.path,
        })
    }

    const setDefault=async(param)=>{
        const idParam = param;
        const parameter ={
            id: idParam,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('dialogueTheme/setAsDefault',parameter);
        
        if(responseJson.status===200){
            alert("SET DEFAULT SUCCESS");
            getData();
        }else{
            alert("SET DEFAULT FAILED");
            getData();
        }
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
        getData()
    }
    
    return(
        <div className="col-md-9">
        <div className="panel panel-default">
            <div className="panel-heading">
                <strong>{props.pageName}</strong> 
            </div>
            <div className="panel-body">

                <div className="table-responsive">
                    <div className="float-end">
                        <a className="float-end btn btn-primary btn-sm tt" onClick={goTo.bind(this)} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                    </div>

                    <div id="h182093w0" className="grid-view">
                        <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                            <Table items={items} edit={getDetail} default={setDefault} loading={loading}/>
                    </div> 
                    <div style={{textAlign:"center"}}>
                        <Pagination
                        activePage={activePage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalData}
                        pageRangeDisplayed={pageRangeDisplayed}
                        onChange={handlePageChange.bind(this)}
                        />
                    </div>   
                </div>
            </div>
        </div>
    </div>

    )
}

export default Theme;