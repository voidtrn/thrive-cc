import React, { useEffect, useState } from 'react';
import { css } from "@emotion/react";
import BeatLoader from "react-spinners/BeatLoader";
import { env, securityData } from '../helpers/globalHelper';
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

export function cssSourceData(param,type=null){
    let opacity = 1

    if(!param){
        opacity = 0
    }
    return {
        opacity:opacity,transition:"linear",transitionDuration:"0.5s",border:'unset',position:'absolute',top:type=='popup'?'25%':'5%',left:type=='popup'?'37%':'43%'
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
            visibility:visibility,opacity:opacity,transition:"linear",transitionDuration:"0.5s",top:"50%",left:"50%", position:'absolute',transform:'translate(-50%,-50%)'
        }
    
    }else{
        return {
            visibility:visibility,opacity:opacity,transition:"linear",transitionDuration:"0.5s",top:"80%",left:"50%", position:'absolute',transform:'translate(-50%,-50%)'
        }
    
    }
}

export function cssSourceDataButton(param,type='popup'){
    let opacity = 1

    if(!param){
        opacity = 0
    }
    return {
        opacity:opacity,transition:"linear",transitionDuration:"0.5s",border:'unset',position:'absolute',top:type=='popup'?'60%':'5%',left:'34%',width:'32%'
    }
}





export function cssSourceLodingDot(){
  
    return {
        marginBottom:"10px"
    }
}

export function LoadingAdmin(props){
    const loading = props.loading
    return (
        <tbody style={cssSource(loading)}>
            <tr >
                <td style={{border:'unset'}}>
                    <BeatLoader loading={true} css={override} size={20} color={theme.clr_loading||'#5f6ec3'}/>
                </td>
            </tr>
        </tbody>
    )
}

export function LoadingData(props){
    const loading = props.loading
    return (
        <div style={cssSourceData(loading,props.type)}>
            <img src={`${env.assets}img/loading-2.gif`} style={{width:!loading?"0%":"65%"}}/>
            {/* <MoonLoader loading={true} css={override} size={50} color={theme.clr_loading||'#5f6ec3'}/> */}
        </div>
    )
}


export function cssSourceData2(param,type=null){
    let opacity = 1

    if(!param){
        opacity = 0
    }
    return {
        opacity:opacity,transition:"linear",transitionDuration:"0.5s",border:'unset',top:type=='popup'?'80%':'80%',left:type=='popup'?'80%':'80%',width:'100px'
    }
}
export function LoadingData2(props){
    const loading = props.loading
    return (
        <div style={cssSourceData2(loading,props.type)}>
            <img src={`${env.assets}img/loading.gif`} style={{width:!loading?"0%":"65%"}}/>
            {/* <MoonLoader loading={true} css={override} size={50} color={theme.clr_loading||'#5f6ec3'}/> */}
        </div>
    )
}

export function LoadingFrontHutChallenge(props){
    const loading = props.loading
    return (
        <div  style={cssSourceData(loading,props.type)}>
            <img src={`${env.assets}img/loading-2.gif`}/>
            {/* <MoonLoader loading={true} css={override} size={50} color={theme.clr_loading||'#5f6ec3'}/> */}
        </div>
    )
}



export function LoadingPage(props){
    const [loading,setLoading] = useState(true)

    useEffect(()=>{
        let timer = setTimeout(()=>setLoading(props.loading),1000)
        return () => {
            clearTimeout(timer)
        }
    },[props.loading])

    return(
        <div>
            <div style={cssSourcePage(loading)}>
                <img src={`${env.assets}img/loading-2.gif`} style={{width:"80%",marginTop:"150px"}}/>
                {/* <MoonLoader loading={true} css={override} size={50} margin={4} height={20} width={300} color={theme.clr_loading||'#5f6ec3'}/> */}
            </div>
            <div style={cssTarget(loading)}>
                {props.children}
            </div>

        </div>
    )
}

export function LoadingDataButton(props){
    const loading = props.loading
    return (
        <div style={cssSourceDataButton(loading,props.type)}>
            <img src={`${env.assets}img/loading-2.gif`} style={{width:"80%"}}/>
            {/* <MoonLoader loading={true} css={override} size={50} color={theme.clr_loading||'#5f6ec3'}/> */}
        </div>
    )
}

export function LoadingDataButtonHUTChallenge(props){
    const loading = props.loading
    return (
        <div style={cssSourceLodingDot(loading,props.type)}>
            <img src={`${env.assets}img/Loading-dot.gif`} />
        </div>
    )
}

export function LoadingDatatable(){
    return (
        <div style={{ padding: '24px' }}>
            <BeatLoader loading={true} css={override} size={20} color={theme.clr_loading||'#5f6ec3'}/>
        </div>
    )
}