import React, { useContext, useEffect, useState } from 'react';
import { securityData } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import defaultLang from '../../helpers/lang';
import { cssTarget, LoadingData } from '../../components/Loading';
import Pagination from 'react-js-pagination';
import moment from 'moment';
import GlobalState from '../../helpers/globalState';
import { useParams } from 'react-router-dom';
import Style from '../../components/styleTraining';
import routeAll from '../../helpers/route';

const year = (new Date()).getFullYear();

function training_team(props){
    const param = axiosLibrary.getParamString(props.location.search)
    const pageRangeDisplayed = 5
    const limit = 10
    const years = Array.from(new Array(10),(val, index) => index + year)
    const [global, setGlobal] = useContext(GlobalState)
    let { id }= useParams()
    const [state, setState] = useState({
        userName: securityData.Security_UserName(),
        profilePicture:securityData.Security_UserProfilePicture(),
        platform_id: securityData.Security_getPlatformId(),
        listRegistered:[],
        dataList:[],
        dataUser:{},
        scheduleList:[],
        statusAllTraining:[],
        countStatusTraining:[],
        tabCategory:[
            {id:0,title:'Total Training',status:"all",color:'',icon:'fa-calculator', active:true},
            {id:1,title:'Belum Konfirmasi',status:"noregistered",color:'orange',icon:'fa-calendar', active:false},
            {id:2,title:'Terdaftar',color:'green',status:"registered",icon:'fa-calendar', active:false},
            {id:3,title:'Tidak Dihadiri',color:'orange',status:"noattended",icon:'fa-remove', active:false},
            {id:4,title:'Dihadiri',color:'green',status:"attended",icon:'fa-check', active:false},
        ],
        titlePage:props.pageName,
        selectStatusInput:param && param.keyword||"",
        selectMonthInput:param && param.month||"",
        selectYearInput:param && param.year||"",
        loading:true,
        activePage:1,
        offset:0,
        totalData:0,
        queryString:axiosLibrary.decodeEncodeUri(id,'decode')
        
    })

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            getDataUser()
        }
    },[])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){
            if(state.selectYearInput!=""){
                getTrainingData()
                countStatus()
            }

            if(state.selectMonthInput==""&& state.selectYearInput==""){
                getTrainingData()
                countStatus()
            }
            
        }
    },[state.selectMonthInput, state.selectYearInput, state.dataUser, state.selectStatusInput, state.offset, global.modalProp.loadContent])

    const getTrainingData = async () => {
        setState(state=>({...state, loading:true}))
        let param={
            platform_id: state.platform_id,
            limit: limit,
            offset: state.offset,
            category:"",
            user_id:state.dataUser.id,
            status: state.selectStatusInput,
            currentDateTime:moment().format('YYYY-MM-DD HH:mm:ss')
        }

        if(state.selectMonthInput!==""){
            param = {...param,month:state.selectMonthInput}
        }

        if(state.selectYearInput!==""){
            param = {...param,year:state.selectYearInput}
        }

        let response = await axiosLibrary.postData('awbTraining/ListTrainingStatus',param)
        if(response.status===200){
            setState(currentState=>({...currentState, 
                dataList:response.data.data, 
                totalData:response.data.countData,
                loading:false
            }))
        }
    }

    const getDataUser = async () => {
        const md5IdUser = await axiosLibrary.getmd5FromBackend(state.queryString.id)
        if(md5IdUser){
            const param = {
                md5ID: md5IdUser,
                platform_id:securityData.Security_getPlatformId()
            }
            const responseGetDataUser = await axiosLibrary.postData('awbUser/SelectData',param);
            if(responseGetDataUser.status===200){
                setState(currentState=>({...currentState, 
                    dataUser:responseGetDataUser.data.data
                }))
                props.setLoading(false)
            }
        }
    }

    const countStatus = async () => {
        const param = {
            platform_id:state.platform_id,
            currentDateTime:moment().format('YYYY-MM-DD HH:mm:ss'),
            user_id:state.queryString.id
        }

        let response = await axiosLibrary.postData('awbTraining/CountTrainingStatus',param)
        if(response.status===200){
            setState(currentState=>({...currentState, countStatusTraining:response.data}))
        }
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setState(state=>({...state, activePage: pageNumber, offset:offsetNew}))
    }

    const renderStatusTraining = (trainingData)=>{
        const yourId = securityData.Security_UserId()
        const supervisorIdInUser = state.dataUser.supervisor_id
        // const userId ="asd" hanya untuk testing
        let isiHtml = null
        if(state.dataList){
            if(trainingData.date_rsvp){
                isiHtml = <a tabIndex={0} role="button">{state.tabCategory[2].title}</a>
            }else{
                isiHtml = <>Belum Konfirmasi</>
            }
            if(trainingData.date_attended){
                isiHtml = <>{isiHtml} dan <span ><a style={{color:state.tabCategory[4].color}}>{state.tabCategory[4].title}</a></span></>
                if( moment(moment.utc(trainingData.schedule_end_time)).format() <= moment().format()){
                    if(yourId === supervisorIdInUser){
                        isiHtml =   <>{isiHtml} <br/> 
                                        <span className="btn btn-outline-white btn-refser"
                                            onClick={()=>setGlobal(global=>({...global,
                                                            modalProp:  {
                                                                            modalShow:true, 
                                                                            type: 'changeStatus',
                                                                            id_training: trainingData.id, 
                                                                            training_name:trainingData.training_name, 
                                                                            action:"notAttend", 
                                                                        }
                                                        }))}
                                        >Ubah Tidak Hadir</span>
                                    </>
                    }
                }
            }else{
                if( moment(moment.utc(trainingData.schedule_end_time)).format() <= moment().format()){
                    isiHtml = <>{isiHtml} dan <span ><a style={{color:state.tabCategory[3].color}}>{state.tabCategory[3].title}</a></span></>
                    if(yourId === supervisorIdInUser){
                        isiHtml =   <>{isiHtml} <br/> 
                                        <span className="btn btn-outline-white btn-refser"
                                             onClick={()=>setGlobal(global=>({...global,
                                                modalProp:  {
                                                                modalShow:true, 
                                                                type: 'changeStatus',
                                                                id_training: trainingData.id, 
                                                                training_name:trainingData.training_name, 
                                                                action:"attend", 
                                                            }
                                            }))}
                                        >Ubah Hadir</span>
                                    </>
                    }
                }
            }
        }
        const html = <div>{isiHtml}</div>
        return(
            html
        )

    }

    return(
        <>
        <Style/>
        <div id="topic" className="section-topic">
            <div className="container web-tour-section-topic">
                <div className="row justify-content-center2">
                    <div className="col-md-12">
                        <div className=" text-center">
                            <h2 className="section-title">{state.titlePage}</h2>
                                {/* <a href={`${routeAll.routeTrainingTeam.trainingTeams.parentPath}/${axiosLibrary.decodeEncodeUri('?id=1000451879&level=spv','encode')}`}>test link</a> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="container" style={{padding:"40px 80px 0px"}}> 
            <div className="col-md-12">
                <div className="tab-style1 div-redeem-profile">
                    <div className="tab-content">
                        <div className="tab-pane fade active show" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div className="row col-md-12" style={{top:"-10px",position:'relative'}}>
                                <div className="col-md-2">
                                    <div className="profile-img" title={state.dataUser.account}
                                        style={{backgroundImage:`url(${state.dataUser.profile_picture})`}}>
                                    </div>
                                </div>
    
                                <div className="col-md-4">
                                    <div className="user-identity">
                                        <span>
                                            Detail List Training
                                        </span>
                                        <h3>{state.dataUser.name}</h3>
                                        <a href={`${routeAll.routesUser.profile.path}#MyTeams`}  //href={routeAll.routesUser.profile.path} 
                                        className="btn btn-outline-white btn-refer">Back to MyTeams</a>
                                    </div>
                                </div>
                                <div className="col-md-6" >
                                    <div className="row">
                                        {state.tabCategory.map((x,idx)=>
                                            <div className={idx%2?"col-md-3":"col-md-2"} style={{textAlign:'center'}} key={idx}>
                                                <div className="your-current-level-and-points">
                                                    {/* <a onClick={()=>changeTab(x.id)} data-id={x.id} style={{cursor:"pointer"}}> */}
                                                        <span className="user-points">
                                                            {state.countStatusTraining.message ? state.countStatusTraining[`data${x.id}`][0].total:0}
                                                        </span>
                                                        <span className="user-status" style={{color:x.color}}><i className={`fa ${x.icon}`}></i> {x.title}</span>                                    
                                                    {/* </a> */}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                    </div>
                </div>
            </div>
        </div>
    
        <div className="tab-content profile-tabs-containter">
            <div id="Leaderboard" className="tab-pane active show">	
                <div className="content-badges-achieved">	
                    <form method="get" className="form-horizontal">
                        <div className="form-group">
                            <div className="col-sm-5">
                                <select className="form-control select-filter inputSearch" name="status" value={state.selectStatusInput} onChange={(e)=>setState(state=>({...state, selectStatusInput:e.target.value}))}>
                                    <option value="">Semua Status</option>
                                    <option value="attended">Dihadiri</option>
                                    <option value="noattended">Tidak Dihadiri</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="col-sm-5">
                                <select className="form-control select-filter inputSearch" name="month" value={state.selectMonthInput} onChange={(e)=>setState(state=>({...state, selectMonthInput:e.target.value}))}>
                                    <option value="">Bulan</option>
                                    <option value="01">Januari</option>
                                    <option value="02">Februari</option>
                                    <option value="03">Maret</option>
                                    <option value="04">April</option>
                                    <option value="05">Mei</option>
                                    <option value="06">Juni</option>
                                    <option value="07">Juli</option>
                                    <option value="08">Agustus</option>
                                    <option value="09">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <div className="col-sm-5">
                                <select className="form-control select-filter inputSearch" name="year" value={state.selectYearInput} onChange={(e)=>setState(state=>({...state, selectYearInput:e.target.value}))}>
                                    <option value="">Tahun</option>
                                    {years.map((year, index) =>
                                        <option value={year} key={`year${index}`}>{year}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </form>
                    <div className="row" style={cssTarget(!state.loading)}>	
                        <div className="col-md-12">	
                            <LoadingData loading={state.loading}/>
                        </div>	
                    </div>
                    {state.dataList.length > 0 ?
                        <div style={cssTarget(state.loading)}> 
                            {state.dataList.map((v,idx)=>
                                <div className="row rowleaderboardFromId" key={idx}>
                                    <div className='col-sm-5 itemPicsName' style={{textAlign:'left', display:'flex'}}>
                                        <div style={{alignSelf:'center'}}>
                                            {v.training_name}
                                        </div>
                                    </div>
                                    <div className='col-sm-3 itemLeaderboard' title="Daftar Jadwal" style={{display:'flex'}}>
                                        <div style={{alignSelf:'center'}}>
                                            <i className="fa fa-calendar"></i> {v.schedule_date} &nbsp;
                                            <i className="fa fa-clock-o"></i> {v.schedule_start_time_indo} - {v.schedule_end_time_indo} <br/>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div style={{alignSelf:'center'}}>
                                            {renderStatusTraining(v)}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <br/>
                            <div style={{display:"flex",justifyContent:"center"}}>
                                <Pagination
                                itemClass="page-item"
                                linkClass="page-link"
                                activePage={state.activePage}
                                itemsCountPerPage={limit}
                                totalItemsCount={state.totalData}
                                pageRangeDisplayed={pageRangeDisplayed}
                                onChange={(e)=>handlePageChange(e)}
                                />
                            </div>
                        </div>
                    :
                        <div className="row" style={cssTarget(state.loading)}>	
                            <div className="col-md-12">	
                                <h4 style={{textAlign:'center'}}>{defaultLang.lang.general_no_data_available}</h4>	
                            </div>	
                        </div>
                    }
                </div>
            </div>
        </div>
        <br/>
        <br/>
        <br/>
        <br/>
        </>
    
    );
}

export default training_team;