import { Component } from "react"
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;
export default class vw_footer extends Component{

    render(){
        
        return(
        <>
        <style>
            {
                `
                #footer{
                    padding-top:27px;
                }
                `
            }
        </style>
            <footer id="footer" className="fixed-bottom">
            <div className="copyright">
            <p>{LoginData.Security_getTheme().text_footer}</p>
            </div>
            </footer>
        </>
        );
    }
}
