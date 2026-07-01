import React, { useContext, useEffect, useState } from 'react';
import { securityData } from '../../helpers/globalHelper';
import axiosLibrary from '../../helpers/axiosLibrary';
import defaultLang from '../../helpers/lang';
import { cssTarget, LoadingData } from '../../components/Loading';
import Pagination from 'react-js-pagination';
import moment from 'moment';
import GlobalState from '../../helpers/globalState';
import Style from '../../components/styleTraining';
import { useHistory } from 'react-router-dom';
import routeAll from '../../helpers/route';

const year = (new Date()).getFullYear();

var _ = require('lodash');

function training(props){
    const history = useHistory()
    const param = axiosLibrary.getParamString(props.location.search)
    const hash = axiosLibrary.getParamString(props.location.hash)
    const pageRangeDisplayed = 5
    const limit = 10
    const years = Array.from(new Array(10),(val, index) => index + year)
    const [global, setGlobal] = useContext(GlobalState)
    const [state, setState] = useState({
        userName: securityData.Security_UserName(),
        profilePicture:securityData.Security_UserProfilePicture(),
        platform_id: securityData.Security_getPlatformId(),
        listRegistered:[],
        tabCategory:[
            {id:0,title:'Semua Training',status:"",color:'orange',icon:'fa-calendar', active:false},
            {id:1,title:'Belum Konfirmasi',status:"noregistered",color:'orange',icon:'fa-calendar', active:false},
            {id:2,title:'Terdaftar',color:'green',status:"registered",icon:'fa-calendar', active:true},
            {id:3,title:'Tidak Dihadiri',color:'orange',status:"noattended",icon:'fa-remove', active:false},
            {id:4,title:'Dihadiri',color:'green',status:"attended",icon:'fa-check', active:false},
        ],
        dataList:[],
        scheduleList:[],
        statusAllTraining:[],
        countStatusTraining:[],
        titlePage:props.pageName,
        /// permintaan dila active tabs di nomor 2
        tabMenuTypeActive:2,
        searchInput:param && param.keyword||"",
        selectMonthInput:param && param.month||"",
        selectYearInput:param && param.year||"",
        loading:true,
        activePage:1,
        offset:0,
        totalData:0,
        submitSearch:true,
    })

    useEffect(()=>{

        if(hash && hash.tabMenu){
            changeTab(hash.tabMenu)
        }

        //link dari email blast training
        if(hash && hash.platform && hash.tabMenu){
            localStorage.setItem("loadingNow", true);
            props.setLoading(true)
            axiosLibrary.cekLinkTraining()
        }
        //end

    },[])
    
    useEffect(()=>{

        //set false untuk loading page
        if(!localStorage.getItem("loadingNow")){
            if(!state.loading){
                props.setLoading(false)
            }
        }
        //end

    },[state.loading])

    useEffect(()=>{
        if(securityData.Security_getPlatformId()){

            setState(state=>({...state, loading:true}))
            if(state.submitSearch){
                if(state.selectYearInput!=""){
                    getDatalist()
                    getStatusAllTraining()
                    countStatus()
                }else{
                    setState(state=>({...state, loading:false}))
                }
    
                //validation month input and year input not empty
                if(state.selectMonthInput==""&& state.selectYearInput==""){
                    getDatalist()
                    getStatusAllTraining()
                    countStatus()
                }

                //change link every state in filter change
                history.push({
                    pathname: routeAll.routesUser.training.path,
                    search:"?" + new URLSearchParams({keyword: state.searchInput}).toString() + "&" +  new URLSearchParams({month: state.selectMonthInput}).toString() + "&" + new URLSearchParams({year: state.selectYearInput}).toString(),
                    hash: "#" + new URLSearchParams({tabMenu: state.tabMenuTypeActive}).toString()
                })
                //end
            }
        }
    },[state.selectMonthInput, state.selectYearInput, state.tabMenuTypeActive, state.offset, global.modalProp.loadContent, state.submitSearch])

    useEffect(()=>{
        //go to tab after transaction in modal
        if(global.goToTabMenu){
            changeTab(global.goToTabMenu)
            setGlobal(global=>({...global,goToTabMenu:false}))
        }
        //end
    },[global.goToTabMenu])

    const getDatalist = async () => {
        setState(state=>({...state, loading:true}))
        let param={
            platform_id: state.platform_id,
            limit: limit,
            offset: state.offset,
            category:"",
            user_id:securityData.Security_UserId(),
            status: state.tabCategory[state.tabMenuTypeActive].status,
            currentDateTime:moment().format('YYYY-MM-DD HH:mm:ss')
        }

        if(state.selectMonthInput!==""){
            param = {...param,month:state.selectMonthInput}
        }

        if(state.selectYearInput!==""){
            param = {...param,year:state.selectYearInput}
        }

        if(state.searchInput!==""){
            param = {...param,filter_search:state.searchInput}
        }

        let response = await axiosLibrary.postData(state.tabMenuTypeActive===0?'awbTraining/ListDataForFO':'awbTraining/ListTrainingStatus',param)
        if(response.status===200){
            setState(currentState=>({...currentState, 
                dataList:response.data.data, 
                totalData:response.data.countData,
                scheduleList: state.tabMenuTypeActive===0 ? response.data.scheduleList : response.data.data,
                loading:false
            }))
        }
    }

    const countStatus = async () => {
        const param = {
            platform_id:state.platform_id,
            currentDateTime:moment().format('YYYY-MM-DD HH:mm:ss')
        }

        let response = await axiosLibrary.postData('awbTraining/CountTrainingStatus',param)
        if(response.status===200){

            setState(currentState=>({...currentState, countStatusTraining:response.data, loading:false}))
        }
    }

    const getStatusAllTraining = async () => {
        setState(state=>({...state, loading:true}))
        let response = await axiosLibrary.postData('awbTraining/cekStatusAllTraining',{platform_id:state.platform_id})
        if(response.status===200){
            setState(currentState=>({...currentState, statusAllTraining:response.data, loading:false}))
        }
    }

    const changeTab = (value)=>{
        const getIndexOldTab = state.tabCategory.findIndex(v=>v.active===true)
        state.tabCategory[getIndexOldTab].active = false
        const getIndexCurrentTab = state.tabCategory.findIndex(v=>v.id==value)
        state.tabCategory[getIndexCurrentTab].active = true
        setState(state=>({...state, 
            tabMenuTypeActive: state.tabCategory[getIndexCurrentTab].id, 
            activePage:1,
            offset:0
        }))
    }

    const handlePageChange= (pageNumber)=> {
        var offsetNew = (pageNumber - 1) * limit;
        setState(state=>({...state, activePage: pageNumber, offset:offsetNew}))
    }

    const renderSchedule = (id_training)=>{
        if(!state.loading){
            switch (state.tabMenuTypeActive) {
                case 0:
                    return(
                        state.scheduleList && state.scheduleList.filter(x=>x.awb_training_id===id_training).map((z,idx)=>
                        <div key={idx}>
                            <i className="fa fa-calendar"></i> {z.schedule_date} &nbsp;
                            <i className="fa fa-clock-o"></i> {z.schedule_start_time_indo} - {z.schedule_end_time_indo} <br/>
                        </div>
                        )
                    )
                default:
                    return(
                        state.dataList && state.dataList.filter(x=>x.training_id===id_training).map((z,idx)=>
                            <div key={idx}>
                                <i className="fa fa-calendar"></i> {z.schedule_date_indo} <br/>
                                <i className="fa fa-clock-o"></i> {z.schedule_start_time_indo} - {z.schedule_end_time_indo} <br/>
                            </div>
                        )
                    )
            }
        }
        
    }

    const renderStatusTraining = (id_training)=>{
        if(!state.loading){
            let isiHtml = null
            switch (state.tabMenuTypeActive) {
                case 0:
                    if(state.statusAllTraining.data1 && state.statusAllTraining.data1.filter(x=>x.training_id===id_training).length > 0)
                        state.statusAllTraining.data1.filter(x=>x.training_id===id_training).map((v)=>{
                            if(v.date_rsvp){
                                isiHtml = <a tabIndex={0} role="button" key={v.training_id}>{state.tabCategory[2].title}</a>
                            }else{
                                isiHtml = <a onClick={()=>changeTab(1)} data-id={1} style={{cursor:"pointer"}} key={v.training_id}>{state.tabCategory[1].title}</a>
                            }
                            if(v.date_attended){
                                isiHtml = <div key={v.training_id}>{isiHtml} dan <span ><a style={{color:state.tabCategory[4].color}}>{state.tabCategory[4].title}</a></span></div>
                            }else{
                                if( moment(moment.utc(v.schedule_end_time)).format() <= moment().format()){
                                    isiHtml = <div key={v.training_id}>{isiHtml} dan <span ><a  style={{color:state.tabCategory[3].color}}>{state.tabCategory[3].title}</a></span></div>
                                }
                            }
                        })
                    else{
                        if(state.scheduleList){
                            const current_schedule_training = state.scheduleList.filter(x=>x.awb_training_id===id_training)
                            const current_training_name = state.dataList.filter(v=>v.training_id===id_training);
                            const current_training_desc = _.orderBy(current_schedule_training, ['registration_end_date'], ['desc']);
                            isiHtml = moment(moment.utc(current_training_desc[0].registration_end_date)).format() > moment().format()? 
                                <span className="btn btn-outline-white btn-refer" style={{padding:"2px 5px"}} 
                                    onClick={()=>setGlobal(global=>({...global,
                                        modalProp:{
                                            modalShow:true, 
                                            type: 'registerTraining',
                                            idSchedule:current_training_desc[0].id, 
                                            id_training: id_training, 
                                            training_name:current_training_name[0].training_name, 
                                            registerType:"new", 
                                            messageTitlePopup: `${defaultLang.lang.titleModalRegisterTraining} ${current_training_name[0].training_name}`}}))}
                                > 
                                    Saya ingin Daftar 
                                </span>
                                :
                                <div>Tidak tersedia</div>
                        }
                    }
    
                    const html = <div>{isiHtml}</div>
                    return(
                        html
                    )
                default:
                    isiHtml = null
                    if(state.statusAllTraining.data1 && state.statusAllTraining.data1.filter(x=>x.training_id===id_training).length > 0)
                        state.statusAllTraining.data1.filter(x=>x.training_id===id_training).map((v)=>{
                            if(v.date_attended){
                                isiHtml = <div key={v.training_id}>Telah Hadir pada <br/><i className='fa fa-calendar'></i> {moment(moment.utc(v.date_attended).toDate()).format('lll')}</div>
                            }else{
                                if(state.scheduleList){
                                    const current_schedule_training = state.scheduleList.filter(x=>x.training_id===id_training)
                                    if(current_schedule_training.length > 0){
                                        const current_training_desc = _.orderBy(current_schedule_training, ['registration_end_date'], ['desc']);
                                        isiHtml =   moment(moment.utc(current_training_desc[0].registration_end_date)).format() > moment().format() 
                                                    &&
                                                    <div key={v.training_id}>
                                                        <span className="btn btn-outline-white btn-refer" style={{padding:"2px 5px"}}
                                                            onClick={()=>setGlobal(global=>({...global,
                                                                modalProp:{
                                                                    modalShow:true, 
                                                                    type: 'registerTraining',
                                                                    idSchedule:current_training_desc[0].id, 
                                                                    id_training: id_training, 
                                                                    training_name:current_training_desc[0].training_name, 
                                                                    registerType:"change", 
                                                                    messageTitlePopup: `${defaultLang.lang.titleModalChangeScheduleTraining} ${current_training_desc[0].training_name}`}}))}
                                                        > Ganti Jadwal </span>
                                                    </div>

                                        if(v.date_rsvp){
                                            const tglEndTime = moment(moment.utc(v.schedule_end_time)).add(1,'h')
                                            isiHtml = moment(moment.utc(v.schedule_start_time)).format() <= moment().format() && tglEndTime.format() >= moment().format() ?
                                                    <>{isiHtml} <span className="btn btn-outline-white btn-refser" onClick={
                                                        ()=>setGlobal(global=>({...global,
                                                            modalProp:{
                                                                modalShow:true, 
                                                                type: 'saveAgreeTraining',
                                                                idDate:current_training_desc[0].id,
                                                                training_name:v.training_name,
                                                                action:'attend' }}))
                                                    }>
                                                        Klik untuk menyatakan Hadir 
                                                    </span></>
                                                    :
                                                    <>{isiHtml}</>
                                            
                                        }else{
                                            isiHtml = moment(moment.utc(v.schedule_end_time)).format() > moment().format()?
                                            <>{isiHtml} 
                                                <span className="btn btn-outline-white btn-refser" onClick={
                                                    ()=>setGlobal(global=>({...global,
                                                        modalProp:{
                                                            modalShow:true, 
                                                            type: 'saveAgreeTraining',
                                                            idDate:current_training_desc[0].id,
                                                            action:'registered' }}))
                                                }>SIMPAN & SETUJU</span>
                                            </>
                                            :
                                            <>{isiHtml}</>
                                            
                                        }
                                    }
                                }
                            }
                        })
                    else{
                        isiHtml = <>User tidak terdaftar</>
                    }

                    const htmlDefault = <div>{isiHtml}</div>
                    return(
                        htmlDefault
                    )
            }
        }
    }

    const renderLinkVideoConference = (id_training)=>{
        if(!state.loading){
            let isiHtml = null
            switch (state.tabMenuTypeActive) {
                case 4:
                    if(state.statusAllTraining.data1 && state.statusAllTraining.data1.filter(x=>x.training_id===id_training).length > 0){
                        state.statusAllTraining.data1.filter(x=>x.training_id===id_training).map((v)=>{
                            if(v.date_attended){
                                isiHtml = 
                                moment(moment.utc(v.schedule_start_time)).format() <= moment().format() && 
                                v.hyperlink_url && 
                                <a href={v.hyperlink_url} target='_blank' rel="noreferrer" className='btn btn-outline-white btn-refser'>Link Video Conference</a>
                            }
                        })
                    }
                    const html = <div>{isiHtml}</div>
                    return(
                        html
                    )
                default:

                    const htmlDefault = <div>{isiHtml}</div>
                    return(
                        htmlDefault
                    )
            }
        }
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
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="container" style={{padding:"40px 80px 20px"}}> 
        <div className="col-md-12">
            <div className="tab-style1 div-redeem-profile">
                <div className="tab-content">
                    <div className="tab-pane fade active show" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <div className="row col-md-12" style={{top:"-10px",position:'relative'}}>
                            <div className="col-md-2">
                                <div className="profile-img" title={state.userName}
                                    style={{backgroundImage:`url(${state.profilePicture})`}}>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="user-identity">
                                    <h3>Hai {state.userName}</h3>
                                    <span>
                                        Daftar Training Saya
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-6" >
                                <div className="row">
                                    {state.tabCategory.filter(v=>v.id!==0).map((x,idx)=>
                                        <div className="col-md-3" style={{textAlign:'center'}} key={idx}>
                                            <div className="your-current-level-and-points">
                                                <a onClick={()=>changeTab(x.id)} data-id={x.id} style={{cursor:"pointer"}}>
                                                    <span className="user-points">
                                                        {state.countStatusTraining.message && state.countStatusTraining[`data${x.id}`][0].total}
                                                    </span>
                                                    <span className="user-status" style={{color:x.color}}><i className={`fa ${x.icon}`}></i> {x.title}</span>                                    
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
	        </div>
        </div>
    </div>

    <div className="container profile-container">
            <div className="wrapper profile-wrapper">
                <ul className="nav nav-tabs profile-tabs list " id="myPrsofileTab">
                    {state.tabCategory.map((v,idx)=>
                        <li id="registered" className={v.active?"active show":"show"} key={idx}>
                            <a onClick={()=>changeTab(v.id)} data-id={v.id} style={{cursor:"pointer"}}>{v.title}</a>
                        </li>
                    )}
                </ul>
            </div>
        </div>

        <div className="tab-content profile-tabs-containter">
            <div id="Leaderboard" className="tab-pane active show">	
		        <div className="content-badges-achieved">
                    <form method="get" className="form-horizontal">
					    <div className="form-group">
						    <div className="col-sm-12">
                                <input type="text" placeholder="Cari Training" name="keyword" value={state.searchInput} onChange={(e)=>setState(state=>({...state, searchInput:e.target.value}))} className="form-control inputSearch"/>
                                <button type="submit" onClick={()=>setState(state=>({...state, submitSearch:true}))} value="send" className="search_icon2"><i className="ion-ios-search-strong"></i></button>
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
                                    <div className='col-sm-5 itemPicsName' style={{textAlign:'left'}}>
                                            {v.training_name}
                                            {renderLinkVideoConference(v.training_id)}
                                    </div>
                                    <div className='col-sm-3 itemLeaderboard' title="Daftar Jadwal" style={{display:'flex'}}>
                                        <div style={{alignSelf:'center'}}>
                                            {renderSchedule(v.training_id)}
                                        </div>
                                    </div>
                                    <div className="col-md-4" style={{display:'flex', justifyContent:'center'}}>
                                        <div style={{alignSelf:'center'}}>
                                            {renderStatusTraining(v.training_id)}
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
                                <hr/>
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

export default training;