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
    const totalData = props.totalData
    const file_path = props.file_path
    var sortIndex = 0

    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Article ID
                    </th>
                    <th >
                        {'Section & Menu'}
                    </th>
                    <th>
                        Category
                    </th>
                    <th>
                        Title
                    </th>
                    <th>
                        Description <br/>
                        Flag Share Spesific User
                    </th>
                    <th>
                        Article Preview
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
                        <td>{item.article_id}</td>
                        <td>{item.section_title}<br/>{item.menu_title}</td>
                        <td>{item.category_title}</td>
                        <td>{item.title}</td>
                        <td>{item.description}<br/>
                            <strong>Shared Mode :</strong>{item.flag_show_spesific_user ? 'spesific ' + item.total_show_spesific_user + ' users' : 'all user'}
                        </td>
                        <td style={{maxWidth:"250px"}}><img  style={{width:"90px",height:"auto"}} src={file_path + 'article/' + item.article_image}  alt={item.article_image} />
                        </td>
                        <td style={{width:"150px"}}><span style={ item.flag_active ? {} :{  color:"#ff0707" } }>{item.flag_active ? 'active' :'inactive'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.edit.bind(this, item.id)} >
                                <i className="fa fa-pencil"></i>&nbsp; edit</a> {""}
                            <a className="btn btn-danger btn-xs tt" onClick={props.deleteArticle.bind(this, item.id)}>
                                <i className="fa fa-times"></i>&nbsp; delete</a>
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

function ArticlePinned(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    // const user_id = securityData.Security_UserId()
    const file_path = env.userDocument

    // const [listSectionMenu, setListSectionMenu] = useState([])
    const [listSection, setListSection] = useState([])
    const [sectionIdFilter, setSectionIdFilter] = useState('')
    
    const pageRangeDisplayed = 1
    const limit = 8

    const getTotalPage = useCallback(async () => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            sectionId:sectionIdFilter,
            sortBy:'pinned_article',
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListData',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[sectionIdFilter, offset])

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            sectionId:sectionIdFilter,
            sortBy:'pinned_article',
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListData',credentials);
        setItems(isi.data.data)
        getTotalPage()
    },[sectionIdFilter,offset])

    const getSectionList = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbArticle/ListSectionPinnedArticle',credentials);
        setListSection(isi.data.data)
        // setLoading(false)
    })

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.articleDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()// your data array of objects
        })
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        // if(categoryId !== 'null'){
            getData();
        // }
    },[offset, sectionIdFilter, props.articleItems])

    useEffect(() => {
        // if(categoryId !== 'null'){
            getSectionList();
        // }
    },[platform_id])

    const handleSearchInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        switch(target.name){
            case 'section_id':
                setSectionIdFilter(value);
                break;
            default:      
        }
    }

    const deleteArticle= async (idParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("id", idParam);
        let responseJson = await axiosLibrary.postData("awbArticle/DeleteData", fd);
        if(responseJson.status === 200){
            // filterButton()
            alert('Data has been deleted')
            getData()
        }else{
            alert(responseJson);
        }
            
    }

    const moveUp = async(id,sort_index)=>{
        const param = {
            id:id,
            sort_index: sort_index,
            platform_id:platform_id
        }
        let responseJson = await axiosLibrary.postData('awbArticle/MoveUp',param);
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
        let responseJson = await axiosLibrary.postData('awbArticle/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    return(        
        <div className="panel-body"> 

            <div className="row">
                <div className="col-md-4">
                    <div className="mb-3">
                        <label className="form-label">&nbsp;Section </label>
                        <select value={sectionIdFilter} style={{width:"100%"}} className="form-control filter-data" 
                            id="section_id" name="section_id" onChange={handleSearchInputChange}>
                            <option value="">-select all-</option>
                            {listSection.map(
                                (itemSection) =>
                                <option key={itemSection.id} value={itemSection.id}>
                                    {itemSection.description}
                                </option>
                            )
                            }
                        </select>
                        <div className="help-block"></div>
                    </div>   
                </div>
            </div>

            <hr/>

            <div className="table-responsive" >
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} edit={getDetail} totalData={totalData} file_path={file_path}
                            deleteArticle={deleteArticle} moveUp={moveUp} moveDown={moveDown} loading={loading}/>
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

export default ArticlePinned;