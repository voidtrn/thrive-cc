import React, { useCallback, useEffect, useState} from 'react';
import axiosLibrary from '../../helpers/axiosLibrary';
import { securityData } from '../../helpers/globalHelper';
import { cssTarget, LoadingAdmin } from '../../components/Loading';

function WorkshopSharingInfoMenu(props){
    
    const [textInfo, setTextInfo] = useState([])
    const [loading, setLoading] = useState(false)
    const platform_id = securityData.Security_getPlatformId()
    const user_id = securityData.Security_UserId()

    const [displayText, setDisplayText] = useState(false)

    const [listMenu, setListMenu] = useState([])
    const [menuId, setMenuId] = useState('null')

    const getTextInfo = useCallback(async (menuIdParam) => {
        let md5MenuId = await axiosLibrary.getmd5FromBackend(menuIdParam)
        const credentials = {
            menuId:md5MenuId,
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbTextInfo/SelectDataByMenu',credentials);
        setTextInfo(isi.data.data)
    })

    const getMenu = useCallback(async () => {
        const credentials = {
            platform_id:platform_id
        };

        let isi = await axiosLibrary.postData('awbMenu/MenuSpecial',credentials);
        if(isi.data.data){
            setListMenu(isi.data.data)
        }else{
            setListMenu([])
        }
        
    })

    // useEffect(()=>{
    //     getData()
    // },[getData])

    useEffect(() => {
        getMenu()
    },[platform_id])
    
    const handleMenuChange = (event) => {
        const target = event.target;
        const value = target.value;
        setMenuId(value)
    }

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;

        var stateCopy = Object.assign({}, textInfo);
        stateCopy[key] = value;

        setTextInfo(stateCopy)
    }

    useEffect(() => {
        if(props.keyTab==='#tab-3'){
            if(menuId !== 'null'){
                setDisplayText(true)
            }else{
                setDisplayText(false)
            }
            getTextInfo(menuId);
        }
    },[menuId, props.keyTab])

    const updateData= async ( menuIdParam) =>{
        // e.preventDefault();
        const fd = new FormData();
        fd.append("awb_mst_menu_id", menuIdParam);
        fd.append("text_info",textInfo.text_info);
        fd.append("user_modified", user_id);
        fd.append("platform_id", platform_id);
        if(menuIdParam){
            setLoading(true)
            //for edit data
            let responseJson = await axiosLibrary.postData("awbTextInfo/SubmitDataMenu", fd);
            if(responseJson.status === 200){
                alert("DATA HAS BEEN UPDATED");
                // history.push(routeAdmin.pages.path)
                setLoading(false)
            }else{
                alert(responseJson);
                setLoading(false)
            }
        }
    }

    return(      
        <div>  
            <LoadingAdmin loading={loading}/>                                  
            <div className="panel-body" style={cssTarget(loading)}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">&nbsp;Menu </label>
                                <select value={menuId} style={{width:"100%"}} className="form-control filter-data" id="id_menu" name="id_menu" onChange={handleMenuChange.bind(this)}>
                                <option value="null">-select one-</option>
                                {listMenu.map(
                                    (itemMenu) =>
                                    <option key={itemMenu.id} value={itemMenu.id}>
                                        {itemMenu.title}
                                    </option>
                                )
                                }
                                </select>
                        </div>
                    </div>
                    
                </div>
                <hr/>
                {displayText?
                    <div>
                        <div className="mb-3 field-usereditform-email required">
                            <label className="form-label" htmlFor="usereditform-email">&nbsp;Text Info </label>
                            <textarea style={{width:"100%",height:"250px"}} className="form-control" 
                                name="text_info" aria-required="true" aria-invalid="false" value={textInfo.text_info?textInfo.text_info:''} onChange={handleInputChange} ></textarea>
                            <div className="help-block"></div>
                        </div>
        
                        <button type="submit" className="btn btn-primary" name="btnSubmit" value="submit" onClick={updateData.bind(this,menuId)}>Update</button>
                    </div>
                :''
                }
                
            </div>
            
        </div>
    )
}

export default WorkshopSharingInfoMenu;