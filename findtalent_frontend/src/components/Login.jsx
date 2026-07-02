import { Component } from 'react';
import React from 'react';
import AuthHelpers from '../helpers/AuthHelpers';
import {Helmet} from "react-helmet-async";
import GlobalHelper from '../helpers/GlobalHelper';
import {isMobile} from 'react-device-detect';
import SSO from '../helpers/SSO';
// import '../CSS/login.css';

var {AllRoute, env} = SSO;
class Login extends Component{

  constructor(props){
    super(props)
    this.state = {
      account: "",
      items:[],
      isLogin:false
    };
    this.login = this.login.bind(this);
    this.onChange = this.onChange.bind(this);
    this.auth = this.auth.bind(this);
    // this.goToHomePage = this.goToHomePage(this);
  }
  
 componentDidMount() {
  localStorage.clear();
 }

 login = async (e) => {
    //e.preventDefault();
    const account = e;
    let responseLogin = await AuthHelpers.postData("findTalentLogin",{account:account});
    //console.log(responseLogin);
    if(responseLogin.status === 200){
      var ads ={
        Cz_ads:1
      }
      var response = {...responseLogin.data.data,...ads};

      //insert to activityLog

      //end insert to activityLog

      if(response.first_login === null){
        var first_login = {
          Cz_firstLogin: 1
        }
        var response = {...response,...first_login};
      }

      if(localStorage.getItem("Cz_findtalent_request_uri")){
        const current_url = localStorage.getItem("Cz_findtalent_request_uri");
        localStorage.removeItem("Cz_findtalent_request_uri");
        const srcToken = GlobalHelper.GetParameterQueryStringByName('src_token', current_url)
        if(srcToken != '')
        {
          const mobile = isMobile();
          const param = {
            isMobile : mobile,
            token : srcToken
          }
          let responseCheckUserAccess = await AuthHelpers.postData("CheckUserAccess",param);
        }
      }
      //alert("JSON");
      //alert(responseLogin.data.token);
      localStorage.setItem("userinfo", JSON.stringify(response));
      localStorage.setItem('token_from_backend', JSON.stringify(responseLogin.data.token))
      return true
    }else{
       localStorage.setItem("userInfo", "DENIED")
       //alert(responseLogin);
       return false
    }
  }

  auth = (e)=>{
    e.preventDefault();
     const account = this.state.account;
     this.login(account).then(function(result){
       if(result){
        window.location.href = AllRoute.root;
       }else{
        window.location.href = AllRoute.denied;
       }
     });
   }

  onChange(e){
    this.setState({[e.target.name]:e.target.value});
  }

  render(){    
    const {items} = this.state;
      return (
      <main>
        <Helmet>
          <title>Login - page</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
          <meta name="csrf-param" content="_csrf"/>
          <link href={env.assets+"_sila/humhub/bootstrap.css"} rel="stylesheet"/>
          <link href={env.assets+"_sila/humhub/jquery-ui.css"} rel="stylesheet"/>
          <link href={env.assets+"_sila/humhub/font-awesome.min.css"} rel="stylesheet"/>
          <script src={env.assets+"_sila/humhub/jquery.js"}></script>
          <script src={env.assets+"_sila/humhub/bootstrap.js"}></script>
          <link href={env.assets+"_sila/humhub/theme.css"} rel="stylesheet"/>
          <link href={env.assets+"_sila/humhub/login.css"} rel="stylesheet"/>
        </Helmet>
        
        <div id="layout-content">
          <br></br>
            <div className="container" style={{textAlign: "center"}}>
              <br />
              <br />
        
              { items.map((item, id) => <h1 key={id}>{item.name}</h1> )  }
        
              <div className="panel panel-default animated bounceIn" id="login-form" 
              style={{maxWidth: "300px", margin:"0 auto 20px", textAlign:"left"}}
              
              >
        
                <div className="panel-heading"><strong>Please</strong> sign in</div>
        
                <div className="panel-body">
                <p>Find Talent</p><br/>                            
                <p>Please login with your windows account.</p>                            
                    <form id="account-login-form" onSubmit={this.auth}  method="post">         
                    <div className="form-group field-login_username required">
                        <input type="username" id="login_username" name="account" onChange={this.onChange} className="form-control"  placeholder="windows account" aria-required="true"/>
                        <div className="help-block"></div>
                     </div>          
                    <hr />
                    <div className="row">
                        <div className="col-md-4">
                            <button  type="submit" id="login-button" className="btn btn-large btn-primary" data-ui-loader="">Login</button>                
                        </div>
                        <div className="col-md-8 text-end">
                           
                        </div>
                    </div>
        
                    </form>        
                </div>
        
            </div>
            <br />
            {/* <div className="text text-center powered">Powered by <a href="http://www.koi.web.id" target="_blank">Berca</a></div> */}
          </div>
        </div>
      </main>
       );   
  }
}


export default Login;
