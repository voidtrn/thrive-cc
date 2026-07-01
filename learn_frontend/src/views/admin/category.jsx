import React, { useCallback, useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const totalData = props.totalData

    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        {'Section & Menu'}
                    </th>
                    <th>
                        Title
                    </th>
                    <th>
                        Status Active
                    </th>
                    <th>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td><div dangerouslySetInnerHTML={{__html:item.section_title +'<br/>'+item.menu_title}}></div></td>
                        <td>{item.title}</td>
                        <td style={{width:"150px"}}><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span>{item.set_as_default ? '(set as default)' :''}</td>
                        
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a>
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <p style={{paddingTop:"4px"}}>
                                {(sortIndex > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''}
                                {(sortIndex < totalData) ?
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-down"></i></a>
                                : ''}  
                            </p>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function Category(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()
    const [listSectionMenu, setListSectionMenu] = useState([])
    const [menuId, setMenuId] = useState('')
    var menuIdStr = ''
    
    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback(async (menuIdStr) => {
        const credentials = {
            limit: limit,
            offset:offset,
            menuId: menuIdStr,
            category:"COUNT",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCategory/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async (menuIdStr) => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            menuId: menuIdStr,
            category:"",
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCategory/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage(menuIdStr)
    },[offset,getTotalPage])

    const getSectionMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbCategory/ListSectionMenu',credentials);
        setListSectionMenu(isi.data.data)
        setLoading(false)
    },[offset])

    // useEffect(()=>{
    //     getData()
    // },[getData])

    useEffect(() => {
        getSectionMenu()
    },[getSectionMenu])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.categoryDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            menu_id: menuId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbCategory/MoveUp',param);
        if(responseJson.status===200){
            getData(menuId)
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            menu_id: menuId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbCategory/MoveDown',param);
        if(responseJson.status===200){
            getData(menuId)
        }else{
            alert(responseJson.status)
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbCategory/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData(menuId)
        }else{
            alert(responseJson.status)
        }
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    const handleSectionMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        menuIdStr = value;
        setMenuId(value)
        getData(menuIdStr);
    }

    return(
            <div className="col-md-9">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div className="row">
                            <div className="col-md-8">
                                <strong>{props.pageName}</strong> 
                            </div>
                            <div className="col-md-4">
                                <div className="float-end">
                                    <a className="float-end btn btn-primary btn-sm tt" href={routeAdmin.categoryDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                                </div>
                            </div>
                        
                        </div>
                    </div>
                    
                    <div className="panel-body">

                        <div className="row">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">&nbsp;Section - Menu </label>
                                        <select value={menuId} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={handleSectionMenuChange.bind(this)}>
                                        <option value="empty">-select one-</option>
                                        {listSectionMenu.map(
                                            (itemSectionMenu) =>
                                            <option key={itemSectionMenu.id} value={itemSectionMenu.id}>{itemSectionMenu.description.replace('<br>','')}</option>
                                        )
                                        }
                                        </select>
                                </div>
                            </div>
                            
                            
                        </div>
                        <hr/>
                        <div className="table-responsive">
                            
                            <div id="h182093w0" className="grid-view">
                                <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                                    <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} deleteItem={deleteItem} totalData={totalData} loading={loading}/>
                            </div> 
                            <div style={{display:"flex",justifyContent:"center"}}>
                                { totalData > limit?
                            
                                <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={activePage}
                                itemsCountPerPage={limit}
                                totalItemsCount={totalData}
                                pageRangeDisplayed={pageRangeDisplayed}
                                onChange={handlePageChange.bind(this)}
                                />
                                :
                                ''
                            }
                            </div>   
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default Category;