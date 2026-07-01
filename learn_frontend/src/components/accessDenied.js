import React, { useEffect } from 'react';
import { securityData, env } from '../helpers/globalHelper';
const theme = securityData.Security_getTheme()
function AccessDenied(props){
    useEffect(()=>{
      if(props.location.data != undefined){
        if(!props.location.data.accessPlatform){
          //alert("YOU DONT HAVE ACCESS TO THIS PAGE");
        }
      }else{
        securityData.Security_RedirectAdmin()
      }
      props.loading(false)
    },[])

    return(
        <div id="layout-content">
        <br></br>
          <div className="container" style={{textAlign: "center"}}>
            <center>
              <img className="img-rounded" style={{height: "400px"}} src={env.assets+'img/UnderMaintenance.png'}/>
            </center>
            <i>AWB is currently under maintenance started from March 1st and will be available on April 1st.<br/> For learning inquiries please contact people-culture.learning@pmi.com</i>         

        </div>
      </div>
    )
}

export default AccessDenied;