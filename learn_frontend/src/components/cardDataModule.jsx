import React from 'react';
import { Card } from 'react-bootstrap';
import { env, securityData } from '../helpers/globalHelper';
import defaultLang from '../helpers/lang';

export default function CardDataModule(props){
    const lang = securityData.Security_lang()
    const userDocument = env.userDocument

    const renderOptionalDescription = (data) =>{
        let renderData = ''
        
        if(data.flag_required == 0){
            renderData = defaultLang.lang.opsional
        }

        return(
            renderData
        )
    }

    return(
        <div className="card-horizontal">
            <Card.Img className={`img-square-wrapper`} src={userDocument + (props.data.images ||props.data.content_image)} />
            <Card.Body className="card-body-step-3-skill">
                <div className="d-flex flex-row pb-3 pe-2">
                    <div>
                        <Card.Text className={`module-type-of-content text-uppercase`}>{lang==='ENG'?props.data.content_type_title_eng:props.data.content_type_title_ind}</Card.Text>
                    </div>
                    <div className="ms-auto"> 
                        <Card.Text className={`module-type-of-content font-italic`}>
                            <div className="text-end module-optional">{renderOptionalDescription(props.data)}</div>
                        </Card.Text>
                    </div>
                </div>
                
                <Card.Title className={`module-title`}>{lang==='ENG'?props.data.title||props.data.content_title_eng:props.data.title_ind||props.data.content_title_ind}</Card.Title>
                <Card.Text className="text-white module-description">
                    <div dangerouslySetInnerHTML={{__html:
                        lang==='ENG'?props.data.description||props.data.content_description_eng:props.data.description_ind||props.data.content_description_ind
                    }}/>
                </Card.Text>
            </Card.Body>
        </div>
    )
}