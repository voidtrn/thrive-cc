import React, { useEffect, useState } from 'react';
import { css } from "@emotion/react";
import BeatLoader from "react-spinners/BeatLoader";
import BounceLoader from "react-spinners/BounceLoader";
import { securityData } from '../helpers/globalHelper';
import { isMobile } from 'react-device-detect';

const override = css`
  display: block;
  margin: 0 auto;
//   border-color: red;
`;

const theme = securityData.Security_getTheme()

export function cssTarget(param){
    let opacity = 0
    let visibility='hidden'
    if(!param){
        opacity = 1
        visibility='visible'
    }
    return {
        visibility:visibility,opacity:opacity,transition:"linear",transitionDuration:"0.5s"
    }
}

export function cssSource(param){
    let opacity = 1
    if(!param){
        opacity = 0
    }
    return {
        opacity:opacity,transition:"linear",transitionDuration:"0.5s",position:'absolute',top:"50%",left:"45%",border:'unset'
    }
}

export function cssSourcePage(param){
    let opacity = 1
    let visibility='visible'
    if(!param){
        opacity = 0
        visibility='hidden'
    }
    if(isMobile){
        return {
            visibility:visibility,opacity:opacity,transition:"linear",transitionDuration:"0.5s",top:"40%",left:"37%", position:'absolute'
        }
    
    }else{
        return {
            visibility:visibility,opacity:opacity,transition:"linear",transitionDuration:"0.5s",top:"40%",left:"47%", position:'absolute'
        }
    
    }
}

export function LoadingAdmin(props){
    const loading = props.loading
    return (
        <tbody style={cssSource(loading)}> 
            <tr >
                <td style={{border:'unset'}}>
                    <BeatLoader loading={true} css={override} size={20} color={theme.clr_loading||'#F5A623'}/>
                </td>
            </tr>
        </tbody>
    )
}

export function LoadingPage(props){
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        let timer = setTimeout(()=>setLoading(props.loading),3000)
        return () => {
            clearTimeout(timer)
        }
    },[props.loading])

    return(
        <div>
            <div style={cssSourcePage(loading)}>
                <BounceLoader loading={true} css={override} size={100} margin={4} height={20} width={300} color={theme.clr_loading||'#F5A623'}/>
                <h4>Please Wait</h4>
            </div>
            <div style={cssTarget(loading)}>
                {props.children}
            </div>

        </div>
    )
}