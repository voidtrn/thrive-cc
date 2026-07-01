import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useNavigate } from 'react-router';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.pathFile

    return(
        <table className="table table-hover">
            <thead>
                <tr>

                    <th>
                        Description
                    </th>
                    <th>
                        Slider Image
                    </th>
                    <th style={{width:"100px"}}>
                        Status
                    </th>
                    <th style={{width:"100px"}}>
                        Hyperlink
                    </th>
                    <th >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td style={{ width:"30%" }}>{item.name}</td>
                        <td> <img  style={{ width:"160px", height:"auto" }} src={file_path+ "Slider/" + item.slider_image}    alt="" />
                        </td>
                        <td>
                            <span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'active' :'inactive'}</span>
                        </td>
                        <td>
                            {item.hyperlink}
                        </td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> 
                        </td>
                    </tr>
            )}   
            </tbody>
        </table>
    )
}

function UftConfig(props){
    const history = useNavigate()
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const pageRangeDisplayed = 10
    const limit = 5
    const file_path = env.userDocument

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('uftConfig/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('uftConfig/ListData',credentials);
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
        history.push({
            pathname: routeAdmin.sliderDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong> 
                </div>
                <div className="panel-body">

                    <div className="table-responsive">
                        <div className="pull-right">
                            <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.sliderDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                            {loading? <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> :
                                    <Table items={items} edit={getDetail} pathFile={file_path}/>
                            }
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

export default UftConfig;