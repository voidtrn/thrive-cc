import { Component } from 'react';

class Loading extends Component{
    constructor(props){
        super(props);

      }

    render(){
        return (
            <div data-u="loading" style={{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"1s"}}>
                            <div style={{filter: "alpha(opacity=30)", opacity: "0.3", position: "absolute", display: "block", top: "0px", left: "0px", width: "100%", height: "100%"}}></div>
                            <div style={{position:"absolute", display:"block", background:"url('../assets/images/loading.gif') no-repeat center center", top:"0px",left:"0px",width:"100%",height:"100%"}}></div>
            </div>
        )
    }  
}


export default Loading;