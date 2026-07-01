import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
// import GlobalState from '../../helpers/globalState';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        {'Title & Image Preview'}
                    </th>
                    <th>
                        Url
                    </th>
                    <th>
                        Capacity
                    </th>
                    <th width="20%">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.title}
                            <br/><img  style={{width:"90px",height:"auto"}} src={file_path + 'workshop/' + item.workshop_preview_image}  alt={item.workshop_preview_image} />
                        </td>
                        <td>
                            <a href={item.hyperlink_url} target="_blank" rel="noreferrer">{item.hyperlink_url}</a><br/>
                        </td>
                        <td>{item.capacity}</td>
                        <td style={{width:"150px"}}>
                            <a onClick={props.user.bind(this,item.id)} ><span className="btn btn-success btn-xs">User</span></a> {" "}
                            <a onClick={props.edit.bind(this,item.id)} ><span className="btn btn-warning btn-xs">Edit</span></a>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function WorkshopSharingWorkshop(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    const file_path = env.userDocument
    const subCategoryType = props.tab

    const [showAddBtn, setShowAddBtn] = useState(true)
    const listCatMenu = props.listCatMenu
    const [categoryId, setCategoryId] = useState(props.categoryId)
    // const [displayText, setDisplayText] = useState(false)

    const pageRangeDisplayed = 10
    const limit = 50

    const getTotalPage = useCallback( async (categoryIdStr) => {
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            sub_category_type:subCategoryType,
            categoryId:md5CategoryId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbWorkshopSharing/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    })

    const getData = useCallback( async (categoryIdStr) => {
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            sub_category_type:subCategoryType,
            categoryId:md5CategoryId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbWorkshopSharing/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage(categoryIdStr)
    })

    // useEffect(()=>{
    //     getData()
    // },[getData])

    useEffect(() => {
        setShowAddBtn(true)
    },[platform_id])
    
    const handleCatMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        // setCategoryId(value)
        props.onCategoryChange(value)
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        // if(categoryId !== 'null'){
        //     setDisplayText(true)
        // }else{
        //     setDisplayText(false)
        // }
        if(props.tab === 'W'){
            if (props.keyTab==='#tab-1'){
                if(categoryId !== ''){
                    getData(categoryId);
                }   
            }
        }
        if(props.tab === 'S'){
            if (props.keyTab==='#tab-2'){
                if(categoryId !== ''){
                    getData(categoryId);
                }
            }
        }
        
    },[categoryId, props.keyTab, offset])

    useEffect(() =>{
        setCategoryId(props.categoryId)
    },[props.categoryId])

    const addNew=async()=>{
        // const idParam = param;
        // let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        // const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.workshopSharingWorkshopCreate.path,
            search: "?" + new URLSearchParams({cat: props.categoryId}).toString()+"&"+new URLSearchParams({tab: props.tab}).toString()// your data array of objects
        })
    }

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.workshopSharingWorkshopEdit.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const workshopUser=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.workshopSharingWorkshopUser.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({cat: props.categoryId}).toString()+"&"+new URLSearchParams({tab: props.tab}).toString()// your data array of objects
        })
    }
   
    return(
        <div>
            <LoadingAdmin loading={loading}/>                                  
            <div className="panel-body" style={cssTarget(loading)}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="control-label">&nbsp;Menu - Category </label>
                                <select value={categoryId} style={{width:"100%"}} className="form-control filter-data" id="id_cat" name="id_cat" onChange={handleCatMenuChange.bind(this)}>
                                <option value="null">-select one-</option>
                                {listCatMenu.map(
                                    (itemCatMenu) =>
                                    <option key={itemCatMenu.awb_trn_category_id} value={itemCatMenu.awb_trn_category_id}>
                                        {itemCatMenu.awb_mst_menu_title + ' > ' +itemCatMenu.awb_trn_category_title}
                                    </option>
                                )
                                }
                                </select>
                        </div>
                    </div>   
                </div>

                
                <div className="row">
                    <div className="col-md-12">
                        {showAddBtn?
                            <div className="pull-right">
                                <a className="pull-right btn btn-primary btn-sm tt" onClick={addNew} ><i className="fa fa-plus aria-hidden="></i> Add new</a>
                            </div>
                        :''
                        }
                    </div>
                </div>

                <hr/>
                <div className="table-responsive">
                            
                    <div id="h182093w0" className="grid-view">
                        <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                            <Table items={items} edit={getDetail} user={workshopUser} file_path={file_path} loading={loading}/>
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
    )
}

export default WorkshopSharingWorkshop;