import { Component } from 'react';
import { Outlet } from 'react-router-dom';
import Head from '../../helpers/Head';
import Navbar from '../vw_menu';
import Record from './vw_record';
import Score from './vw_score';
import SSO from '../../helpers/SSO';

var {LoginData, AllRoute, env} = SSO;

export default class report extends Component{

    constructor(props){
        super(props)
        this.state = {
            redirectAdmin:LoginData.Security_IsAdmin(),
            redirectSuperAdmin:LoginData.Security_IsLoginSuperAdmin(),
            isLoading:true,
        }
        this.loading = this.loading.bind(this);
    }

    loading(val){
        if(val===false){

            this.setState({isLoading:val})
        }
    }

    render(){
        return(
            <>
            <Head/>
                <main>
                <div data-u="loading" style={ this.state.isLoading?{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"0.8s", position:"fixed"}:{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"0.8s", position:"fixed"}}>
                                <div style={{filter: "alpha(opacity=30)", opacity: "0.3", position: "absolute", display: "block", top: "0px", left: "0px", width: "100%", height: "100%"}}></div>
                                <div style={{position:"absolute", display:"block", background:"url('../../assets/images/loading.gif') no-repeat center center", top:"0px",left:"0px",width:"100%",height:"100%"}}></div>
                                <h1>Loading...</h1>
                            </div>
                    
                        <div id="layout-content" style={this.state.isLoading?{visibility:"hidden",opacity:0,transition:"linear",transitionDuration:"0.8s"}:{visibility:"visible",opacity:1,transition:"linear",transitionDuration:"0.8s"}}>
                        
                        
                            <div className="container" >
                            <Navbar/>
                                <div className="row">
                                
                                <style>
                            {
                                `
.search-form .form-group {
  display: inline-table;
    width: 200px;
    height: 35px;
    font-size: 11px;
    margin-right: 30px;
    background-color: #ffffff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.075) inset;
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 0 5px;
}
.search-form .form-group input.form-control {
  padding-right: 20px;
  border: 0 none;
  background: transparent;
  box-shadow: none;
  display:block;
}


.search-form .form-group span.form-control-feedback {
  position: absolute;
  top: -1px;
  right: -2px;
  z-index: 2;
  display: block;
  width: 34px;
  height: 34px;
  line-height: 34px;
  text-align: center;
  color: #3596e0;
  left: initial;
  font-size: 11px;
}

  .grid-view table tbody tr td {
    padding-left: 5px;
    vertical-align: text-top !important;
}

.filter {
    display: inline-grid;
    float: right;
}

                                `
                            }
                        </style>
                        
<Outlet context={{ loadingData: this.loading }} />
                        
                                </div>
                            </div>
                        </div>
                </main>
            </>
        );
    }
}