import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
// import GlobalState from '../../helpers/globalState';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const file_path = props.file_path
    const totalActiveData = props.totalActiveData

    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Headline
                    </th>
                    <th>
                        Short Description
                    </th>
                    <th>
                        Filename
                    </th>
                    <th>
                        Article Id
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
                        <td>{item.headline}</td>
                        <td>{item.short_description}</td>
                        <td>
                            {item.file_type != 'mp4'?
                                <img  style={{width:"90px",height:"auto"}} src={file_path + 'slider_category/' + item.slider_video} alt={item.slider_video} ></img>
                                :
                                (item.slider_video)
                            }
                        </td>
                        <td>{item.article_id}</td>
                        <td style={{width:"100px"}}><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        
                        <td style={{width:"150px"}}>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a> {" "}
                            <a className="btn btn-danger btn-xs tt"  onClick={props.deleteItem.bind(this,item.id)} ><i className="fa fa-times"></i>&nbsp; delete</a>
                            <span hidden>{sortIndex = sortIndex + 1}</span>
                            <p style={{paddingTop:"4px"}}>

                                { (item.flag_active == 1) ? 
                                    (sortIndex > 1) ?
                                        <div style={{display : 'inline-block'}}>
                                            <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-up"></i></a>
                                            &nbsp;
                                        </div>                        
                                    : ''
                                : ''
                                } 
                                { (item.flag_active == 1) ? 
                                    (sortIndex < totalActiveData) ?
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.sort_index)} ><i className="fa fa-arrow-down"></i></a>
                                    : ''
                                : ''
                                } 
                            </p>
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function SliderCategory(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [totalActiveData, setTotalActiveData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const file_path = env.userDocument

    // const [listSectionMenu, setListSectionMenu] = useState([])
    const listSectionMenu = props.listSectionMenu
    const [categoryId, setCategoryId] = useState('null')
    var categoryIdStr = ''
    
    const pageRangeDisplayed = 10
    const limit = 10

    const getTotalPage = useCallback(async (categoryIdStr) => {

        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            categoryId:md5CategoryId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderCategory/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    })

    const getTotalActive = useCallback(async (categoryIdStr) => {
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            categoryId:md5CategoryId,
            flag_active:1,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderCategory/ListData',credentials);
        setTotalActiveData(isi.data.data)
    })

    const getData = useCallback(async (categoryIdStr) => {
        setLoading(true)
        let md5CategoryId = await axiosLibrary.getmd5FromBackend(categoryIdStr)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            categoryId:md5CategoryId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbSliderCategory/ListData',credentials);
        setItems(isi.data.data)
        getTotalActive(categoryIdStr)
        getTotalPage(categoryIdStr)
    })

    // const getSectionMenu = useCallback(async () => {
    //     const credentials = {
    //         platform_id:platform_id
    //     };

    //     let isi = await axiosLibrary.postData('awbSubCategory/ListSectionMenu',credentials);
    //     setListSectionMenu(isi.data.data)
    //     setLoading(false)
    // })

    // useEffect(()=>{
    //     getData()
    // },[getData])

    // useEffect(() => {
    //     getSectionMenu()
    // },[platform_id])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.sliderCategoryDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            categoryId: categoryId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderCategory/MoveUp',param);
        if(responseJson.status===200){
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            categoryId: categoryId,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderCategory/MoveDown',param);
        if(responseJson.status===200){
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }

    const deleteItem = async(id)=>{
        const param = {
            id:id,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbSliderCategory/DeleteData',param);
        if(responseJson.status===200){
            alert('Data has been deleted')
            getData(categoryId)
        }else{
            alert(responseJson.status)
        }
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }
    
    useEffect(() => {
        getData(categoryId);
    },[offset])

    const handleSectionMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        categoryIdStr = value;
        setCategoryId(value)
        getData(categoryIdStr);
    }

    return(
        <div className="panel-body">
            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label className="control-label">&nbsp;Section - Menu - Category </label>
                        <select value={categoryId} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={handleSectionMenuChange.bind(this)}>
                        <option value="null">-select one-</option>
                        {listSectionMenu.map(
                            (itemSectionMenu) =>
                            <option key={itemSectionMenu.id} value={itemSectionMenu.id}>
                                {itemSectionMenu.title_section+' > '+itemSectionMenu.title_menu+' > '+itemSectionMenu.title_category}
                            </option>
                        )
                        }
                        </select>
                        <div className="help-block"></div>
                    </div>
                </div>
            </div>

            <hr/>

            <div className="table-responsive" style={categoryId=='null'?{display:"none"}:{}}>
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} edit={getDetail} moveUp={moveUp} moveDown={moveDown} deleteItem={deleteItem} totalActiveData={totalActiveData} file_path={file_path} loading={loading}/>
                </div> 
                {totalData > limit ?
                    <div style={{display:"flex",justifyContent:"center"}}>
                        <Pagination
                        itemClass="page-item"
                        linkClass="page-link"
                        activePage={activePage}
                        itemsCountPerPage={limit}
                        totalItemsCount={totalData}
                        pageRangeDisplayed={pageRangeDisplayed}
                        onChange={handlePageChange.bind(this)}
                        />
                    </div>   
                :''
                }
            </div>
        </div>
    )
}

export default SliderCategory;