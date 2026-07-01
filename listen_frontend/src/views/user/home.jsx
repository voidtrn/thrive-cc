import React, { useEffect, useState } from 'react';
import { env, securityData } from '../../helpers/globalHelper';
import routeAll from '../../helpers/route';
import{  Modal } from 'react-bootstrap';
import axiosLibrary from '../../helpers/axiosLibrary';
import {Alert} from '../../components/popupAlert';

function Home(props){
    const showFeedback = securityData.Security_ShowUserFeedback()
    const theme = securityData.Security_getTheme()
    const assets = env.assets
    const [loading, setLoading] = useState(true)
    const [modalShow, setModalShow] = useState(false)
    const [hitLike, setHitLike] = useState(false)
    const [hitDislike, setHitDislike] = useState(false)
    const [listFeedBack, setListFeedBack] = useState([])

    const [modalShowRating, setModalShowRating] = useState(false)
    const [idEventRating, setIdEventRating] = useState('')
    const [itemsRating, setItemsRating] = useState([])
    const [modalMessage, setModalMessage] = useState ({
        modalShow:false,
        txtMessage:'test',
        subtitle:false,
        txtSubtitle:''
    })

    const showPopupRating = async () => {
        if(securityData.Security_getPlatformId()){
            const data = {
                id: new URLSearchParams(props.location.search).get('rating'),
                user_id: securityData.Security_UserId(),
                platform_id: securityData.Security_getPlatformId()
            }
            if(data.id !== null){
                let response = await axiosLibrary.postData('dialogueEvent/ValidateId',{id:data.id})
                if(response.data.data){
                    setIdEventRating(data.id)
                    setModalShowRating(true)    
                }
            }
        }
    }

    useEffect(()=>{
        if(showFeedback){
            setModalShow(true)
        }
    },[showFeedback])

    useEffect(()=>{
        showPopupRating()
    },[props.location.search])

    const funcListFeedBack = async (type)=>{
        const param = {
            limit : 5,
            offset : 0,
            category : '',
            platform_id : securityData.Security_getPlatformId(),
            flag_is_like : type,
            status_active : 1
        }
        let response = await axiosLibrary.postData('dialogueFeedback/ListData',param)
        if(response.status===200){
            setListFeedBack(response.data.data)
            setLoading(false)
        }
    }

    const clickLikeDislike = (type) =>{
        setLoading(true)
        funcListFeedBack(type)
        switch (type) {
            case 1:
                setHitLike(true);
                setHitDislike(false)
                break;
            case 0:
                setHitDislike(true);
                setHitLike(false)
                break;
            default:
                break;
        }
    }

    const submitFeedBack = async (value) => {
        const paramInsertFeedbackUser = {
            reason : value.reason,
            flag_feedback : value.flag_is_like,
            user_id	: securityData.Security_UserId(),
            platform_id: securityData.Security_getPlatformId(),
        }
        let response = await axiosLibrary.postData('dialogueFeedback/InsertFeedbackUser',paramInsertFeedbackUser)
        if(response.status===200){
            const paramUpdateActivity ={
                user_id	: securityData.Security_UserId(),
                platform_id: securityData.Security_getPlatformId(),
            }
            let response = await axiosLibrary.postData('dialogueFeedback/UpdateActivity',paramUpdateActivity)
            if(response.status === 200){
                setModalShow(false)
                let dataUser = axiosLibrary.getUserInfo();
                let dataFeedback = {
                    Cz_dlg_feedback:'0'
                }
                dataUser = {...dataUser, ...dataFeedback}
                localStorage.setItem('userinfo',JSON.stringify(dataUser));
                setModalMessage({
                    modalShow:true,
                    txtMessage:theme.txt_alert_thank_you_for_your_feedback,
                    subtitle:false,
                    txtSubtitle:'',
                })
            }
        }
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, itemsRating);
        stateCopy[key] = value;
        setItemsRating(stateCopy)
    }

    const submitEventRating = async () => {

        const param = {
            rating_score : itemsRating.rating,
            rating_reason : itemsRating.txtRating,
            rating_flag : 1,
            id : idEventRating
        }

        let response = await axiosLibrary.postData('dialogueEvent/UpdateData',param)
        if(response.status===200){
            setModalShowRating(false)
            setModalMessage({
                modalShow:true,
                txtMessage:theme.txt_alert_thank_you_for_your_feedback,
                subtitle:false,
                txtSubtitle:''
            })
            // props.chgState({value:theme.txt_alert_thank_you_for_your_feedback,modalShow:true, needSubtitle:false, valueSubtitle:''})
        }
    }

    return(
    <>
        <style>
            {`
                .list-group{
                    padding:0;
                }
                .list-group-item:first-child {
                    border-top: 0px solid #f4f4f4;
                }
            
                .list-group-item {
                    border-top: 1px solid #f4f4f4;
                }
                .tbl-feedback-response{
                    width: 60%;
                    text-align: center;
                    margin: 0px 20% 20px;
            
                }
            
                .a-not-now{
                    color: #5d5c5c;
                    font-size: 17px;
                    text-align: right;
                    font-family: 'ubuntumedium';
                }
            
                .title-choose-reason{
                    padding-bottom:12px;
                }
            
                a.list-group-item:hover{
                    background-color: #d7f5d2;
                }
            
                a.a-disabled:hover,a.a-disabled{
                    background-color: #f4f4f4;
                }
            
                .container{
                    width:100%;
                }
            
                .rating {
                    display: inline-block;
                }
                .rating label{
                    margin:0px;
                }
            
                /* :not(:checked) is a filter, so that browsers that don’t support :checked don’t 
                follow these rules. Every browser that supports :checked also supports :not(), so
                it doesn’t make the test unnecessarily selective */
                .rating:not(:checked) > input {
                    position:absolute;
                    top:-9999px;
                    clip:rect(0,0,0,0);
                }
            
                .rating:not(:checked) > label {
                    float:right;
                    width:1em;
                    /* padding:0 .1em; */
                    overflow:hidden;
                    white-space:nowrap;
                    cursor:pointer;
                    font-size:300%;
                    /* line-height:1.2; */
                    color:#ddd;
                }
            
                .rating:not(:checked) > label:before {
                    content: '★ ';
                }
            
                .rating > input:checked ~ label {
                    color: #ffbb22;
                    
                }
            
                .rating:not(:checked) > label:hover,
                .rating:not(:checked) > label:hover ~ label {
                    color: #ffbb22;
                    
                }
            
                .rating > input:checked + label:hover,
                .rating > input:checked + label:hover ~ label,
                .rating > input:checked ~ label:hover,
                .rating > input:checked ~ label:hover ~ label,
                .rating > label:hover ~ input:checked ~ label {
                    color: #ffbb22;
                    
                }
            
                .rating > label:active {
                    position:relative;
                    top:2px;
                    left:2px;
                }
            
                .lbl-rating{
                    max-width: 100%;
                    margin-bottom: 5px;
                    /* font-weight: bold; */
                    font-size: 12px;
                    font-family: "Roboto", Helvetica Neue, Helvetica, Arial, sans-serif;
                }
                .modal-header .close {
                    // top: -15px
                }
                .
            `}
        </style>
        <div id="page-contents">
            <Alert {...modalMessage}/>
            <div className="container">
                <div className="row">
                    <div className="col-md-3">
                        <div className="dialogue-feature tour-initiate">
                            <a href={routeAll.routesUser.events.path}><img src={theme.img_home_menu_dialog}/></a>
                        </div> 
                        <p className="feature-short-description">
                            {theme.txt_desc_home_menu_dialogue}<br/><br/>
                        </p>
                    </div>     
                
                    <div className="col-md-3">
                        <div className="dialogue-feature tour-yawa">
                            <a href={routeAll.routesUser.yawa.path}><img src={theme.img_home_menu_yawa}/></a>
                        </div> 
                        <p className="feature-short-description">
                            {theme.txt_desc_home_menu_yawa}
                        </p>
                    </div>     
                    <div className="col-md-3">                            
                        <div className="dialogue-feature tour-gallery">
                            <a href={routeAll.routesUser.gallery.path}><img src={theme.img_home_menu_gallery} /></a>
                        </div> 
                        <p className="feature-short-description">
                            {theme.txt_desc_home_menu_gallery}
                        </p>
                    </div>     

                    <div className="col-md-3">                            
                        <div className="dialogue-feature tour-gallery">
                            <a href={routeAll.routesUser.uft.path}><img src={theme.img_home_menu_uft} /></a>
                        </div> 
                        <p className="feature-short-description">
                            {theme.txt_desc_home_menu_uft}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <Modal show={modalShow} onHide={()=>setModalShow(false)}>
            <br/>
            <br/>
            <Modal.Header>
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={()=>setModalShow(false)}><img src={theme.img_close_popup}/></button>
                <Modal.Title>
                    <div dangerouslySetInnerHTML={{
                        __html:theme.txt_popup_feedback_title
                    }}/>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">

                        <div className="mb-3 field-usereditform-email required">                                
                            <table className="tbl-feedback-response">
                                <tr>
                                    <td><a onClick={clickLikeDislike.bind(this,1)} className="imgLike"><img src={assets+"dialogue/like.png"}/></a></td>
                                    <td><a onClick={clickLikeDislike.bind(this,0)} className="imgDislike"><img src={assets+"dialogue/dislike.png"}/></a></td>
                                </tr>
                            </table>
                            <a onClick={()=>setModalShow(false)} className="close float-end a-not-now" data-dismiss="modal" aria-hidden="true">{theme.txt_popup_feedback_not_now}</a>
                            <br/>
                        </div>
                        <h5 className={`modal-title title-choose-reason`} id="myModalSubTitle" style={{display:hitLike || hitDislike? 'block': 'none'}}>{theme.txt_popup_feedback_title_choose_reason}</h5>

                        <div className={`list-group ${hitLike && !hitDislike? `divFeedbackLike`: `divFeedbackDislike`}`} style={{display:hitLike || hitDislike? 'block': 'none'}}>
                            {loading ? 
                                <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> 
                                :
                                listFeedBack.map(value => 
                                    <a onClick={submitFeedBack.bind(this,value)} className="list-group-item list-group-item-action a-feedback" key={value.id}>{value.reason}</a>
                                )
                            }
                        </div>
                    </div>
                </div>
            </Modal.Body>
        </Modal>

        <Modal show={modalShowRating} onHide={()=>setModalShowRating(false)}>
            <br/>
            <br/>
            <Modal.Header>
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={()=>setModalShowRating(false)}><img src={theme.img_close_popup}/></button>
                <br/>
                <h4 className="modal-title" id="myModalTitle">{theme.txt_popup_rating_title}</h4>
                <h5 className="modal-title" id="myModalTitle">{theme.txt_popup_rating_subtitle}</h5>
            </Modal.Header>
            <Modal.Body>
                <div className="tab-content">
                    <div className="tab-pane active" data-tab-index="0" id="tab-0">
                        <div className="container">
                            <div className="row" style={{textAlign:'center'}}>
                                <div className="rating">
                                    <input type="radio" id="star5" name="rating" value="5" onChange={handleInputChange}/><label htmlFor="star5" title="Meh">5 stars</label>
                                    <input type="radio" id="star4" name="rating" value="4" onChange={handleInputChange}/><label htmlFor="star4" title="Kinda bad" >4 stars</label>
                                    <input type="radio" id="star3" name="rating" value="3" onChange={handleInputChange}/><label htmlFor="star3" title="Kinda bad">3 stars</label>
                                    <input type="radio" id="star2" name="rating" value="2" onChange={handleInputChange}/><label htmlFor="star2" title="Sucks big tim">2 stars</label>
                                    <input type="radio" id="star1" name="rating" value="1" onChange={handleInputChange}/><label htmlFor="star1" title="Sucks big time">1 star</label>
                                </div>
                            </div>
                            <h4 style={{textAlign:'center', marginTop:"-5px"}} className="lbl-rating" >{theme.txt_popup_rating_label}</h4>
                        </div>

                        <div className="mb-3 field-usereditform-email required">
                                <label className="form-label lbl-rating" style={{float:'right'}}>&nbsp;{theme.txt_popup_rating_boundaries_comment}</label>
                            
                                <textarea id="txtRating" name="txtRating" maxLength="500"
                                    placeholder={theme.txt_popup_rating_placeholder_comment} 
                                    className="form-control"cols="20" rows="5" style={{height:"100px !important", lineHeight:"unset !important"}} value={itemsRating.txtRating || ''} onChange={handleInputChange}/>
                                
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <input type="submit" className="btn-style" id="btnSubmit" name="btnSubmit" value="Submit" onClick={submitEventRating}></input>
            </Modal.Footer>
        </Modal>
    </>
    )
}

export default Home;