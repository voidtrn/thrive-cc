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
    const totalData = props.totalData

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Name
                    </th>
                    <th >
                        Function
                    </th>
                    <th>
                        Action
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.directorate}</td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a>
                            &nbsp;
                            {(item.sort_index > 1) ?
                                <div style={{display : 'inline-block'}}>
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-up"></i></a>
                                    &nbsp;
                                </div>
                            : ''}
                            {(item.sort_index < totalData) ?
                            <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-down"></i></a> 
                            : ''}
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Hof(props){
    const history = useNavigate()
    
    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    
    const pageRangeDisplayed = 10
    const limit = 5

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('dialogueUserHof/ListData',credentials);
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

        let isi = await axiosLibrary.postData('dialogueUserHof/ListData',credentials);
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
            pathname: routeAdmin.hofDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('dialogueUserHof/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('dialogueUserHof/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
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
                            <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.hofDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} totalData={totalData} loading={loading}/>

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

export default Hof;