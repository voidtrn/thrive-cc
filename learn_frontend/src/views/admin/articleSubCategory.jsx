import React, { useCallback, useEffect, useState} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../helpers/useHistory';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import { cssTarget, LoadingAdmin } from '../../components/Loading';
import { Modal } from 'react-bootstrap';
// import GlobalState from '../../helpers/globalState';

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
                        Description
                    </th>
                    <th>
                        Sub Category
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
                        <td>{item.title}
                            <br/><img  style={{width:"90px",height:"auto"}} src={file_path + 'article/' + item.article_image}  alt={item.article_image} />

                            </td>
                        <td style={{width:"250px"}}>{item.description}<br/>
                            <strong>Shared Mode :</strong>{item.flag_show_spesific_user ? 'spesific ' + item.total_show_spesific_user + ' users' : 'all user'}
                            </td>
                        <td valign="top"><b>{item.sub_category_title}</b></td>
                        
                        <td>
                        <span onClick={props.showModal.bind(this,item.id,item.title,item.sub_category_id)} className="btn btn-primary btn-xs">Change Sub Category</span>
                           
                        </td>
                    </tr>
            )}   
            </tbody>
            <LoadingAdmin loading={props.loading}/> 
        </table>
    )
}

function ArticleSubCategory(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [offset, setOffset] = useState(0)
    const [totalData, setTotalData] = useState(0)
    const [activePage, setActivePage] = useState(1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()
    const file_path = env.userDocument

    // const [listSectionMenu, setListSectionMenu] = useState([])
    const listSectionMenu = props.listSectionMenu
    const [listSubCategory, setListSubCategory] = useState([])
    const [categoryId, setCategoryId] = useState('null')
    const [subCategoryId, setSubCategoryId] = useState('')
    const [categoryTitle, setCategoryTitle] = useState('')
    const [displaySearch, setDisplaySearch] = useState('none')
    const [showModalState, setShowModalState] = useState(false)

    const [articleIdEdit, setArticleIdEdit] = useState('')
    const [titleArticleEdit, setTitleArticleEdit] = useState('')
    const [subCategoryIdEdit, setSubCategoryIdEdit] = useState('')

    var categoryIdStr = ''
    
    const pageRangeDisplayed = 10
    const limit = 10

    const getTotalPage = useCallback(async (categoryIdStr, subCategoryIdStr, categoryTitleStr) => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"COUNT",
            categoryId:categoryIdStr,
            subCategoryId:subCategoryIdStr,
            str_where:categoryTitleStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListDataArticleByCategory',credentials);
        setTotalData(isi.data.data)
        setLoading(false)
    },[offset])

    const getData = useCallback(async (categoryIdStr, subCategoryIdStr, categoryTitleStr) => {
        setLoading(true)
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            categoryId:categoryIdStr,
            subCategoryId:subCategoryIdStr,
            sortBy:"of_the_month",
            str_where:categoryTitleStr,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbArticle/ListDataArticleByCategory',credentials);
        setItems(isi.data.data)
        getTotalPage(categoryIdStr, subCategoryIdStr, categoryTitleStr)
    },[offset])

    // const getSectionMenu = useCallback(async () => {
    //     const credentials = {
    //         platform_id:platform_id
    //     };

    //     let isi = await axiosLibrary.postData('awbSubCategory/ListSectionMenu',credentials);
    //     setListSectionMenu(isi.data.data)
    //     setLoading(false)
    // })

    const getSubCategory = useCallback(async (categoryIdStr) => {
        const credentials = {
            limit: limit,
            offset:offset,
            category:"",
            categoryId:categoryIdStr,
            platform_id:platform_id
        };
        // alert(categoryId)
        let isi = await axiosLibrary.postData('awbSubCategory/ListData',credentials);
        setListSubCategory(isi.data.data)
        setLoading(false)
    })

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
            pathname: routeAdmin.subCategoryDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()// your data array of objects
        })
    }

    
    const showModal = (idEdit, titleParam, subCategoryIdParam)=>{
        setArticleIdEdit(idEdit)
        setTitleArticleEdit(titleParam)
        setSubCategoryIdEdit(subCategoryIdParam)
        setShowModalState(true)
    }
    
    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setActivePage(pageNumber)
        setOffset(offsetNew)
    }

    useEffect(() => {
        if(categoryId !== 'null'){
            getData(categoryId, subCategoryId, categoryTitle);
        }
    },[offset])

    const handleSectionMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        categoryIdStr = value;
        setCategoryId(value)
        getData(categoryIdStr, subCategoryId, categoryTitle);
    }

    const handleSearchInputChange = (event) => {
        const target = event.target;
        const value = target.value;
        switch(target.name){
            case 'id_sub_cat':
                setSubCategoryId(value);
                break;
            case 'title':
                setCategoryTitle(value);
                break;
            case 'sub_category_id':
                setSubCategoryIdEdit(value);
                break;
            default:
                
        }
    }

    const updateData= async (idParam, subCategoryParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        
        fd.append("sub_category_id", subCategoryParam);
        fd.append("id", idParam);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);
        let responseJson = await axiosLibrary.postData("awbArticle/UpdateData", fd);
        if(responseJson.status === 200){
            // alert("DATA HAS BEEN UPDATED");
            // history.push(routeAdmin.category.path)
            setShowModalState(false)
            filterButton()
        }else{
            alert(responseJson);
        }
            
    }

    const filterButton = () => {
        setActivePage(1)
        setOffset(0)
        getData(categoryId, subCategoryId, categoryTitle);
        // alert(subCategoryId)
    }

    const resetButton = () => {
        setSubCategoryId('')
        setCategoryTitle('')
        setCategoryId('null')
    }

    useEffect(() => {
        if(categoryId != 'null'){
            setDisplaySearch('block')
            getSubCategory(categoryId)
        }else {
            setDisplaySearch('none')
        }
    },[categoryId])

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
            
            <div id='display-search' style={{display:displaySearch}}>
                <div className="row">
                    <div className="col-md-4">
                        <div className="mb-3 field-usereditform-email required">
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Sub Category (Lvl 4) </label>
                            <select value={subCategoryId} style={{width:"100%"}} className="form-control filter-data" id="id_sub_cat" name="id_sub_cat" onChange={handleSearchInputChange.bind(this)}>
                                <option value="">All</option>
                                {listSubCategory.map(
                                    (itemSubCategory) =>
                                    <option key={itemSubCategory.id_sub_category} value={itemSubCategory.id_sub_category}>
                                        {itemSubCategory.title_sub_category}
                                    </option>
                                )
                                }
                            </select>
                            <div className="help-block"></div>
                        </div>   
                    </div>

                    <div className="col-md-3">
                        <div className="mb-3 field-usereditform-email required">
                            <label className="control-label" htmlFor="usereditform-email">&nbsp;Title of Article </label>
                            <input type="text" id="usereditform-email" style={{width:"100%"}} className="form-control"
                                name="title" value={categoryTitle} onChange={handleSearchInputChange.bind(this)} aria-required="true" aria-invalid="false" />
                            <div className="help-block"></div>
                        </div>
                    </div>

                    <div className="col-md-1">
                        <div className="mb-3">
                            <label className="control-label">&nbsp;</label>
                            <div  style={{display:"inline-flex",position:"relative",top:"5px",right:"15px"}}>
                                <button type="button" id="btnFilter" className="btn btn-outline btn-sm btn-danger" onClick={resetButton}><i className="fa fa-refresh"></i>&nbsp;reset</button>&nbsp;
                                <button type="submit" id="btnFilter" className="btn btn-outline btn-sm btn-warning" onClick={filterButton}><i className="fa fa-search"></i>&nbsp;filter</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr/>

            <div className="table-responsive" style={categoryId=='null'?{display:"none"}:{}}>
                <div id="h182093w0" className="grid-view">
                    <div className="summary">Showing <b>{offset+1} - {limit*(activePage-1)+items.length}</b> of <b>{totalData}</b> records.</div>
                        <Table items={items} edit={getDetail} showModal={showModal} totalData={totalData} file_path={file_path} loading={loading}/>
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

            <Modal show={showModalState}
                animation={true}
                onHide={()=>setShowModalState(false)}
                onExited={()=>setShowModalState(false)}
                >
                <Modal.Header style={{justifyContent:'center'}}>
                    <h5>Form Article under Sub Category (Lvl 4)</h5>
                </Modal.Header>

                <Modal.Body style={{padding:" 40px 50px"}}>
                    <div className="mb-3">
						<div className="row">
							<div className="col-md-12">
								<div className="mb-3">
										Title Article : <br />
										<b><span id="title_article" >{titleArticleEdit}</span></b>	
								</div>
							</div>
						</div>
					</div>
                    <div className="mb-3">
						<div className="row">
							<div className="col-md-12">
								<div className="mb-3">
									<label className="control-label">&nbsp;Sub Category (Lvl 4) </label>
									<select value={subCategoryIdEdit} style={{width:"100%"}} className="form-control filter-data" id="sub_category_id" name="sub_category_id" onChange={handleSearchInputChange.bind(this)}>
                                        <option value="">-select one-</option>
                                        {listSubCategory.map(
                                            (itemSubCategory) =>
                                            <option key={itemSubCategory.id_sub_category} value={itemSubCategory.id_sub_category}>
                                                {itemSubCategory.title_sub_category}
                                            </option>
                                        )
                                        }
                                    </select>
								</div>
							</div>
						</div>
					</div>
                    <button type="submit" className="btn btn-success" onClick={updateData.bind(this, articleIdEdit, subCategoryIdEdit)}> Save</button>{' '}
					<span className="btn btn-warning" onClick={()=>setShowModalState(false)} data-dismiss="modal" aria-hidden="true" > Cancel</span>
                </Modal.Body>
            </Modal>

        </div>
          
    )
}

export default ArticleSubCategory;