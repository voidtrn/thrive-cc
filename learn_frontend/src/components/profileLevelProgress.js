import React, { useContext, useEffect, useState } from 'react';
import axiosLibrary from '../helpers/axiosLibrary';
import { env, securityData } from '../helpers/globalHelper';
import defaultLang from '../helpers/lang';
import "../assets/css/cssLevelProgress.scss";
import iconCheck from "../assets/img/icon-check.png";
import iconNoCheck from "../assets/img/icon-nocheck.png";
import iconDownload from "../assets/img/icon-download.png";
import { saveAs } from 'file-saver';
import { Card } from 'react-bootstrap';
import { Element, scroller } from 'react-scroll';
import { cssTarget, LoadingData } from './Loading';
import GlobalState from '../helpers/globalState';

export function LevelProgress(){
    const [state, setState] = useState({});
    const [loading, setLoading] = useState(true);
    const [global] = useContext(GlobalState)
    const platform_id = securityData.Security_getPlatformId();
    const lang = securityData.Security_lang();
    const user_document = env.userDocument
    const assets = env.assets

    const getProfile = async () =>{
        setLoading(true);
        const param = {
            platform_id: platform_id,
        }

        const response = await axiosLibrary.postData('awbProfile/LevelProgress', param);
        if(response.status===200){
            setState(state =>({...state,...response.data}))
            setLoading(false)
        }
    }
    
    const downloadImage = async (data)=>{
        saveAs(data.src, data.file_name||'image')
    }

    useEffect(()=>{
        if(platform_id){
            getProfile()
        }
    },[platform_id])

    useEffect(()=>{
        if(state.level_id){
            scroller.scrollTo('element-'+state.level_id,{
                delay: 2000,
                smooth: 'easeInOutQuart',
                containerId: 'containerElement'
            })
        }
    },[state.level_id])

    useEffect(()=>{
        if(global.loadContentSidebarProfile){
            getProfile()
        }
    },[global.loadContentSidebarProfile])

    const RenderGreenCard = (props) => {
        const {data}=props
        const title = defaultLang.lang.txtTitleGreenCard.replace('[variable0]', data[0].title)
        const textBody = <div dangerouslySetInnerHTML={{__html:defaultLang.lang.txtBodyGreenCard}}/>
        return(
            <Card border="primary" className="mt-4 card-green-card">
                <Card.Header className="card-header-green-card text-center">{title}</Card.Header>
                <Card.Body className="card-body-green-card">
                    {textBody}
                </Card.Body>
            </Card>
        )
    }

    const renderLevelProgress = (v,idx) => {
        const srcIconCheck = v.id <= state.level_id ? iconCheck : iconNoCheck
        const descToUnlock = lang==='ENG'? v.descr_how_to_get_there:v.descr_how_to_get_there_ind
        const descPrivilege = lang==='ENG'? v.descr_your_previlege: v.descr_your_previlege_ind
        const heightStyleProgress = v.id < state.level_id? `100%`: v.id > state.level_id ? `0%` : `${state.progressLevel}%`
        const title = v.id===state.level_id? <>{defaultLang.lang.txtYourLevel}<div className="title-per-level">{v.title}</div></> :<div className="title-per-level">{v.title}</div>
        // const classNameImage = v.id===state.level_id? "col-sm-6 frame-image":"col-sm-3 frame-image frame-image-not-active"
        const classNameImage = v.id <= state.level_id? "frame-image":"frame-image frame-image-not-active"
        // const renderPaddingTop = v.id===state.level_id? null: <div className="padding-top"/>
        const srcImageDownload = v.level_image? user_document+"level/"+v.level_image:null
        const srcImage = v.level_image? assets+"images/level/L"+v.seqnum+".png":null
        const srcIconDownload = v.id <= state.level_id && v.level_image? iconDownload:null
        const greenCard = v.target_green_card? <RenderGreenCard data={state.masterLevel.filter(x=>x.id===v.target_green_card)}/>:null
        const rowDesc = [<div dangerouslySetInnerHTML={{__html:descToUnlock}}/>,<div dangerouslySetInnerHTML={{__html:descPrivilege}}/>,greenCard]

        // return(
        //     <div key={idx} className="d-flex flex-row">
        //         <div className="p-2 flex-shrink-1">
        //             <div className="padding-top"/>
        //             <div><img src={srcIconCheck}/></div>
                    // <div className="vertical-progress-bar">
                    //     <div className="vertical-progress-bar-track">
                    //         <div className="vertical-progress-bar-inner" style={{height:heightStyleProgress}}/>
                    //     </div>
                    // </div>
        //         </div>
        //         <div className="pt-2 pb-2 pl-4 ml-2 pr-2  w-100">
        //             {renderPaddingTop}
        //             <div className='row align-items-center'>
        //                 <div className={`${classNameImage}`} style={{background:`url(${srcImage}) transparent no-repeat center`}}>
        //                     <img src={srcIconDownload} onClick={()=>downloadImage({src:srcImage,file_name:v.level_image})}/>
        //                 </div>
        //                 <div className='col-sm-6 title-group-per-level align-self-center'>{title}</div>
        //             </div>
        //             <div className='row description-per-level pt-3'>
        //                 <div className='col-sm-12'>
        //                     {rowDesc.map((v,idx)=>
        //                         <div className='pt-2 pb-2' key={idx}>{v}</div>
        //                     )}
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // )

        return(
            <div key={idx} className="d-flex flex-column" >
                <div className='d-flex flex-row align-items-center flex-shrink-1'>
                    <div className='pr-4 flex-shrink-1 checklist-img pt-4 pb-4'><img src={srcIconCheck}/></div>
                    <div className='img-level'>
                        <div className={`col-sm-12 ${classNameImage}`} style={{background:`url(${srcImage}) transparent round`}}>
                            <Element className="target-scroll" name={`element-${v.id}`}/>
                            <img src={srcIconDownload} onClick={()=>downloadImage({src:srcImageDownload,file_name:v.level_image})}/>
                        </div>
                    </div>
                    <div className='pl-4 title-group-per-level'>{title}</div>
                </div>
                <div className='d-flex flex-row flex-shrink-1'>
                    <div className='pr-4 flex-shrink-1'>
                        <div className="vertical-progress-bar">
                            <div className="vertical-progress-bar-track">
                                <div className="vertical-progress-bar-inner" style={{height:heightStyleProgress}}/>
                            </div>
                        </div>
                    </div>
                    <div className="description-per-level pt-2 pb-3">
                        {rowDesc.map((v,idx)=>
                            <div className='pt-2 pb-2' key={idx}>{v}</div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return(
        <div className="d-flex flex-column levelProgress">
            <div className="header-title-level-progress pb-4">{defaultLang.lang.headerTitleLevelProgress}</div>
            <LoadingData loading={loading}/>
            <Element id="containerElement" className="content-level-progress content-inner-level-progress overflow-auto" style={cssTarget(loading)}>
                {state.masterLevel?.map((v,idx)=>
                    renderLevelProgress(v,idx)
                )}
            </Element>
        </div>
    )
}