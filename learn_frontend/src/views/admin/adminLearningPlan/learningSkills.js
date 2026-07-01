import React, { 
    useEffect, 
    useState
} from 'react';
import Pagination from 'react-js-pagination';
import {useHistory } from 'react-router';
import axiosLibrary from '../../../helpers/axiosLibrary';
import { 
    // env,
    securityData } from '../../../helpers/globalHelper';
import routeAll from '../../../helpers/route';
import { 
    cssTarget, 
    LoadingAdmin 
} from '../../../components/Loading';

const routeAdmin = routeAll.routesAdmin

function Table(props){
    const items = props.items
    // const file_path = env.userDocument +'learning_skill/'
    return(
        <table className="table table-hover">
            <thead>
                <tr>
                    <th>
                        Title
                    </th>
                    <th>
                        Rating
                    </th>
                    <th>
                        Learning Hours
                    </th>
                    {/* <th>
                        Image
                    </th> */}
                    <th>
                        Status
                    </th>
                    <th style={{width: '25%'}}>
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody style={cssTarget(props.loading)}>

            {items.map(
                (item) =>
                    <tr key={item.id}>
                        <td>{item.title}<br/><br/>{item.title_ind}</td>
                        <td>{item.rating}</td>
                        <td>{item.learning_hours}</td>
                        {/* <td>{item.image? <img  style={{width:"90px",height:"auto"}} src={file_path + item.image} alt={item.image} ></img> :``}</td> */}
                        <td><span style={ item.status_active ? {} :{  color:"#ff0707" } }>{item.status_active ? 'ACTIVE' :'INACTIVE'}</span></td>
                        <td>
                            <a className="btn btn-primary btn-xs tt" onClick={props.getDetail.bind(this,item.id)} ><i className="fa fa-pencil"></i>&nbsp; edit</a>&nbsp;
                            <a className="btn btn-success btn-xs tt" onClick={props.getModule.bind(this,item.id)} ><i className="fa fa-book"></i>&nbsp; module</a>&nbsp;
                            <p style={{paddingTop:"4px", display:'inline-block'}}>
                            { (item.status_active == 1) ? 
                                (item.seqnum > 1) ?
                                    <div style={{display : 'inline-block'}}>
                                        <a className="btn btn-warning btn-xs tt" onClick={props.moveUp.bind(this,item.id,item.seqnum,item.id_key_behavior)} ><i className="fa fa-arrow-up"></i></a>
                                        &nbsp;
                                    </div>                        
                                : ''
                            : ''
                            } 
                            { (item.status_active == 1) ? 
                                (item.seqnum < props.totalData) ?
                                    <a className="btn btn-warning btn-xs tt" onClick={props.moveDown.bind(this,item.id,item.seqnum,item.id_key_behavior)} ><i className="fa fa-arrow-down"></i></a>
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

function LearningSkills(props){
    const history = useHistory()

    const [items, setItems] = useState([])
    const [mainFocusData, setMainFocusData] = useState([])
    const [idMainFocus, setIdMainFocus] = useState("")
    const [loadKeyBehavior,setLoadKeyBehavior] = useState(true)
    const [keyBehavior, setKeyBehavior] = useState([])
    const [idKeyBehavior, setIdKeyBehavior] = useState("")
    const [paginate, setPaginate] = useState([])
    const [paginateActiveData, setPaginateActiveData] = useState([])
    const [activePage, setActivePage] = useState(new URLSearchParams(props.location.search).get('page') ?? 1)
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const limit = 5

    const getMainFocusData = async ()=>{
        const credentials = {
            platform_id:platform_id
        };
        let isi = await axiosLibrary.postData('awbLearningMainFocus/ListData',credentials);
        setMainFocusData(isi.data.data)
    }

    const getKeyBehavior = async () =>{
        setLoadKeyBehavior(true)
        const credentials = {
            platform_id:platform_id,
            id_main_focus:idMainFocus,
            status_active:1
        };
        let isiActive = await axiosLibrary.postData(`awbLearningKeyBehavior/ListData`,credentials);
        setKeyBehavior(isiActive.data.data)
        setLoadKeyBehavior(false)
    }

    const getData = async () =>{
        setLoading(true)
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_key:idKeyBehavior,
            from:'admin'
        };

        let isi = await axiosLibrary.postData(`awbLearningListSkill/ListData?page=${activePage}`,credentials);
        setItems(isi.data.data.data)
        setPaginate(isi.data.data)
        setLoading(false)
    }

    const getTotalActiveData = async()=>{
        const credentials = {
            limit: limit,
            platform_id:platform_id,
            id_key:idKeyBehavior,
            from:'total',
            status_active:1
        };
        let isiActive = await axiosLibrary.postData(`awbLearningListSkill/ListData?page=1`,credentials);
        setPaginateActiveData(isiActive.data.data)
    }

    const getDetail=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.learningSkillsDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: props.name}).toString()+"&"+new URLSearchParams({page: activePage})// your data array of objects
        })
    }

    const getModule=async(param)=>{
        const idParam = param;
        let responseJson = await axiosLibrary.postData('GetMd5',{id:idParam});
        const ID =responseJson.data.data; 
        history.push({
            pathname: routeAdmin.learningModulePerSkillDetail.path,
            search: "?" + new URLSearchParams({data: ID}).toString()+"&"+new URLSearchParams({type: routeAdmin.learningModulePerSkillDetail.name}).toString()// your data array of objects
        })
    }

    const moveUp = async(id,sort_index,id_key_behavior)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_key_behavior:id_key_behavior
        }
        let responseJson = await axiosLibrary.postData('awbLearningListSkill/MoveUp',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const moveDown = async(id,sort_index,id_key_behavior)=>{
        const param = {
            id:id,
            seqnum: sort_index,
            platform_id:platform_id,
            id_key_behavior:id_key_behavior
        }
        let responseJson = await axiosLibrary.postData('awbLearningListSkill/MoveDown',param);
        if(responseJson.status===200){
            getData()
        }else{
            alert(responseJson.status)
        }
    }

    const resetData = (e)=>{
        setIdMainFocus(e.target.value);
        setIdKeyBehavior("")
        setActivePage(1)
    }

    useEffect(()=>{
        if(platform_id){
            getMainFocusData()
        }
    },[])

    useEffect(()=>{
        if(idMainFocus){
            getKeyBehavior()
        }else{
            setLoadKeyBehavior(true)
        }
    },[idMainFocus])

    useEffect(()=>{
        if(idKeyBehavior){
            getData()
        }
    },[activePage,idKeyBehavior])

    useEffect(()=>{
        if(idKeyBehavior){
            getTotalActiveData()
        }
    },[idKeyBehavior])
    
    return(
        <div className="col-md-9">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <strong>{props.pageName}</strong> 
                </div>
                <div className="panel-body">

                    <div className="table-responsive">
                        <div className="pull-right">
                            <a className="pull-right btn btn-primary btn-sm tt" href={routeAdmin.learningSkillsDetail.path} ><i className="fa fa-plus aria-hidden="></i> Add new</a>  
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label">&nbsp;Main Focus</label>
                                    <select defaultValue={idMainFocus} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={(e)=>resetData(e)}>
                                    <option value="">-select one-</option>
                                    {mainFocusData.map(
                                        (item) =>
                                        <option key={item.id} value={item.id}>{item.title_menu.replace('<br>','')}</option>
                                    )
                                    }
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="control-label">&nbsp;Key Behavior</label>
                                    <select defaultValue={idKeyBehavior} style={{width:"100%"}} className="form-control filter-data" id="cat" name="cat" onChange={(e)=>{setIdKeyBehavior(e.target.value);setActivePage(1)}} disabled={loadKeyBehavior}>
                                    <option value="">-select one-</option>
                                    {keyBehavior.map(
                                        (item) =>
                                        <option key={item.id} value={item.id}>{item.title_eng.replace('<br>','')}</option>
                                    )
                                    }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <hr/>

                        <div id="h182093w0" className="grid-view">
                            <div className="summary">Showing <b>{paginate.from} - {paginate.to}</b> of <b>{paginate.total}</b> records.</div>
                                <Table items={items} getDetail={getDetail} moveUp={moveUp} moveDown={moveDown} loading={loading} totalData={paginateActiveData} getModule={getModule} />
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

export default LearningSkills;