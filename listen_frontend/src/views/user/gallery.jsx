import React, {useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { isMobile } from 'react-device-detect';
import { LoadingPage } from '../../components/Loading';
import axiosLibrary from '../../helpers/axiosLibrary';
import { env, securityData } from '../../helpers/globalHelper';

let items = []
const file_path = env.userDocument

function PopupImage(props){
    items = props.chgItem
    const [showModal, setShowModal] = useState(true)

    return(
        <div>
            <style>
                {`
                h5.modal-sub-title {
                    color: #b7b7b7;
                    margin: 10px 10% 0;
                    font-size: 16px;
                    text-align: center;
                    font-family: 'ubuntumedium';
                }
                .dialogue-gallery img {
                    max-width: 100%;
                    box-shadow: 0px 1px 12px 3px rgb(229, 228, 229);
                    height: 250px;
                }
                .dialogue-gallery {
                    text-align: center;
                    margin: 5px;
                }

                img#galleryImage {
                    text-align: center;
                    max-width: 100%;
                }
                `}
            </style>

        <Modal
            show={showModal}
            size="large"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={()=>setShowModal(false)}
            onExited={()=>props.chgState(false)}
            backdrop={true}
            keyboard={false}
        >
        <Modal.Body style={{margin:"1% 1%"}}>
            {<span className="close" onClick={()=>setShowModal(false)}>
                    <i className="fa fa-close custom" ></i>
                </span>
            }
                    <img id="galleryImage" name="galleryImage" className="preview-image" src={file_path+ "gallery/" + items.gallery_image} />
                    <h5 className="modal-sub-title">{items.title}</h5>
        </Modal.Body>
        </Modal>
        </div>
    )
}

function Images(props){

    items = props.items
    const [showModal, setShowModal] = useState(false)
    const [stateItem, setStateItem] = useState([])

    const handleClick = (val) =>{
        if(val===false){
            setShowModal(false)
        }else{
            setShowModal(true)
        }
    }

    return(
        <>
        {items.map((item) =>
            <div className="col-md-4" key={item.id}>
                <div className="dialogue-gallery" onClick={()=>{setShowModal(true);setStateItem(item)}}>
                    <img src={file_path+ "gallery/" + item.gallery_image}  onLoad={<LoadingPage/>}/> 
                    <p className="title">{item.title }</p>
                </div>
            </div>
        )}
        { showModal ? <PopupImage chgState={handleClick} chgItem={stateItem} /> : null }
        </> 
    )
}

function Gallery(props){

    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const platform_id = securityData.Security_getPlatformId()

    const getData = async () => {
        setLoading(true)
        const credentials = {
            category: "",
            platform_id: platform_id
        };
        let isi = await axiosLibrary.postData('dialogueGallery/ListAllGallery', credentials);
        setItems(isi.data.data)
        setLoading(false)
    }

    const insertLogPage= async()=>{
        if(!securityData.Security_getInsertLogGallery()){
            const param = {
                userName: securityData.Security_UserName(),
                userId: securityData.Security_UserId(),
                userAccount: securityData.Security_UserAccount(),
                userEmail: securityData.Security_UserEmail(),
                isMobile: isMobile,
                moduleName: 'Dialogue - ' + securityData.Security_getPlatformName(),
                feature: props.pageName
            }
            if(securityData.Security_getPlatformName()){
                let response = await axiosLibrary.postData("user/ActivityLog",param);
                if(response.status===200){
                    let dataUser = axiosLibrary.getUserInfo();
                    let dataLogYawa = {
                        Cz_dlg_gallery:'1'
                    }
                    dataUser = {...dataUser, ...dataLogYawa}
                    localStorage.setItem('userinfo',JSON.stringify(dataUser));
                }
            }
        }
    }

    useEffect(()=>{
        getData()
        insertLogPage()
    },[])

    return(
        <>
        <style>
            {`
            .dialogue-gallery img {
                max-width: 100%;
                box-shadow: 0px 1px 12px 3px rgb(229, 228, 229);
                height: 250px;
            }
            .dialogue-gallery {
                text-align: center;
                margin: 5px;
            }
            .dialogue-gallery p.title{
                font-family: 'ubuntumedium';
                margin: 10px 0 20px;
            }
        `}
        </style>
        <div id="page-contents">
            <div className="container">
            { loading ? 
                 <div className="text-center"><img src={env.assets+"images/lazyloading.gif"} alt="loading_img"/></div> : 
                <Images items={items}></Images>
            }
            </div>
        </div>
        <br/> 
        </>
    )
}

export default Gallery;