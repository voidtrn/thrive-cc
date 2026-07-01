import React from 'react';
import { securityData } from '../helpers/globalHelper';
const theme = securityData.Security_getTheme()
function NotFound(props){
    props.loading(false)
    return(
        <div id="layout-content">
        <br></br>
          <div className="container" style={{textAlign: "center"}}>
            <a href="/"><img className="img-rounded" src={theme.img_navbar_menu} id="img-logo"/></a>
            <br />
            <br />

            <div className="panel panel-default animated bounceIn" id="login-form" 
            style={{maxWidth: "300px", margin:"0 auto 20px", textAlign:"left"}}
            
            >
      
              <div className="panel-body">
                   <p style={{fontSize:"30px",textAlign:"center"}}>{props.pageName}</p>
              </div>
      
          </div>
          <br />
          <div className="text text-center powered">Powered by <a href="https://www.berca.co.id" target="_blank" rel="noreferrer">Berca</a></div>
        </div>
      </div>
    )
}

export default NotFound;