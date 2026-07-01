import React, { 
    useCallback, 
    useEffect, 
    useState
} from 'react';
import Pagination from 'react-js-pagination';
import { useHistory } from '../../../helpers/useHistory';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    const allSkill = props.allSkill
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Title
                    </th>
                    <th>
                        List Skill
                    </th>
                    <th>
                        Status
                    </th>
                    <th style={{width: '13%'}}>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.title_eng}<br/><br/>{item.title_ind}</td>
                        <td>
                            <ul>
                                {allSkill.filter(x=> x.id_key_behavior==item.id).map((v,idx)=> <li key={idx}>{v.title}</li>)}
                            </ul>
                        </td>
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'ACTIVE' :'INACTIVE'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.getDetail.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a>&nbsp;
                            <p style={{paddingTop:"4px", display:'inline-block'}}>
                            { (item.status_active == 1) ? 
                                (item.seqnum > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.seqnum,item.id_main_focus)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''
                            : ''
                            } 
                            { (item.status_active == 1) ? 
                                (item.seqnum < props.totalData) ?
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.seqnum,item.id_main_focus)} ><i className="fa fa-arrow-down"></i></a>
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

function LearningKeyBehavior(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [mainFocusData, setMainFocusData] = useState([])
    const [allSkill, setAllSkill] = useState([])
    const [idMainFocus, setIdMainFocus] = useState("")
    const [paginate, setPaginate] = useState([])
    const [paginateActiveData, setPaginateActiveData] = useState([])
    const [activePage, setActivePage] = useState(new URLSearchParams(props.location.search).get('page') ?? 1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const limit = 6

    const getMainFocusData = async ()=>{
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbLearningMainFocus/ListData',credentials);
        setMainFocusData(isi.data.data)
    }

    const getAllSkill = async ()=>{
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbLearningKeyBehavior/ListDataSkill',credentials);
        setAllSkill(isi.data.data)
    }

    const getData = useCallback(async () => {
        setLoading(true)
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_main_focus:idMainFocus,
            from:'admin'
        };

        let isi = await axiosLibrary.postData(`awbLearningKeyBehavior/ListData?page=${activePage}`,credentials);
        setItems(isi.data.data.data)
        setActivePage(isi.data.data.current_page)
        setPaginate(isi.data.data)
        setLoading(false)
    },[activePage,idMainFocus])

    const getTotalActiveData = async()=>{
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_main_focus:idMainFocus,
            from:'admin',
            status_active:1
        };
        let isiActive = await axiosLibrary.postData(`awbLearningKeyBehavior/ListData?page=1`,credentials);
        setPaginateActiveData(isiActive.data.data)
    }

    useEffect(()=>{
        if(platform_id){
            getMainFocusData()
            getAllSkill()
        }
    },[])

    useEffect(()=>{
        if(idMainFocus){
            getData()
            getTotalActiveData()
        }
    },[idMainFocus])

    useEffect(()=>{
        getData()
    },[activePage])

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.learningKeyBehaviorDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()+"&"+new URLSearchParams({page: activePage})// your data array of objects
        })
    }

    const moveUp = async(id,sort_index,id_main_focus)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_main_focus:id_main_focus
        }
        let responseJson = await axiosLibrary.postData('awbLearningKeyBehavior/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index,id_main_focus)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_main_focus:id_main_focus
        }
        let responseJson = await axiosLibrary.postData('awbLearningKeyBehavior/MoveDown',param);
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
                            <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.learningKeyBehaviorDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label">&nbsp;Main Focus</label>
                                    <select defaultValue={idMainFocus} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={(e)=>{setIdMainFocus(e.target.value);setActivePage(1)}}>
                                    <option value="">-select one-</option>
                                    {mainFocusData.map(
                                        (item) =>
                                        <option key={item.id} value={item.id}>{item.title_menu.replace('<br>','')}</option>
                                    )
                                    }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{paginate.from} - {paginate.to}</b> of <b>{paginate.total}</b> records.</div>
                                <Table items={items} getDetail={getDetail} allSkill={allSkill} moveUp={moveUp} moveDown={moveDown} loading={loading} totalData={paginateActiveData.total} />
                        </div> 
                        {paginate.total > limit ?
                            <div style={{display:"flex",justifyContent:"center"}}>
                                <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={activePage}
                                itemsCountPerPage={limit}
                                totalItemsCount={paginate.total}
                                pageRangeDisplayed={paginate.per_page}
                                onChange={(e)=>setActivePage(e)}
                                />
                            </div> : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LearningKeyBehavior;