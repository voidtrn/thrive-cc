import React, { 
    useEffect,
    useState
  } from 'react';
import { Modal } from 'react-bootstrap';
import { securityData } from '../helpers/globalHelper';

export function Alert(props){

    const [modalShow, setModalShow] = useState(false)
    const theme = securityData.Security_getTheme()
    const messageTitlePopup =props.txtMessage
    const [messageSubtitlePopup, setMessageSubtitlePopup] = useState(theme.txt_popup_message_subtitle)
    const [needSubtitle, setNeedSubtitle] = useState(false)

    useEffect(()=>{
        if(props.modalShow){
            setModalShow(true)
            if(props.subtitle){
                setNeedSubtitle(props.subtitle)
                setMessageSubtitlePopup(props.txtSubtitle)
            }
        }
    },[props.modalShow])

    return (
        <Modal
            show={modalShow} 
            onHide={()=>setModalShow(false)}
            onExited={()=>setModalShow(false)}
        >
            <br/><br/>
            <Modal.Header>
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={()=>setModalShow(false)}><img src={theme.img_close_popup}/></button>
                <br/><br/>
                <h4 class="modal-title" id="myModalTitle">{messageTitlePopup}</h4>
                {needSubtitle? 
                <h5 class="modal-title" id="myModalSubTitle" style={{display:needSubtitle?'block':'none'}}>{messageSubtitlePopup}</h5>
                
                : null}
            </Modal.Header>
        </Modal>
    )
}