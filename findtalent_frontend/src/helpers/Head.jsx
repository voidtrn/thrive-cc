import { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import {Helmet} from "react-helmet-async";
import SSO from './SSO';

var {LoginData, AllRoute, env} = SSO;
class Head extends Component{

    constructor(props){
        super(props)
        this.state = {
            assets : env.assets,
            assets_sila : env.assets + "_sila/",
            assets_findtalent : env.assets+'findtalent/',
        };
    }
    
    admin(){
        const assets = env.assets;
        const assets_sila = env.assets + "_sila/";
        //const {assets, assets_sila, assets_findtalent} = this.state;
        return(
            <Helmet>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
                <title>Admin Page</title>
                <link rel="stylesheet" href={assets+"fonts/fonts.css"} />

                
                <link href={assets_sila+"humhub/theme.css"} rel="stylesheet"/>
                <link href={assets_sila+"humhub/open-sans.css"} rel="stylesheet"/>
                <link href={assets_sila+"humhub/font-awesome.min.css"} rel="stylesheet"/>

            </Helmet>
        );
    }

    

    root(){
        const assets = env.assets;
        const assets_sila = env.assets + "_sila/";
        const assets_findtalent = env.assets;
        // const {assets, assets_sila, assets_findtalent} = this.state;
        return(
            <Helmet>
            <title>Find Talent</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="content-type" content="text/html;charset=UTF-8"/>
                <meta http-equiv="X-UA-Compatible" content="chrome=1" />
                
                
                <link href={assets_sila+"humhub/theme.css"} rel="stylesheet"/>
                <link href={assets+"_sila/humhub/open-sans.css"} rel="stylesheet"/>
                <link href={assets+"fonts/fonts.css"} rel="stylesheet"/>
                <link rel="stylesheet" href={assets_findtalent+"_pca/style.css" } />
                <link href={assets_sila+"humhub/font-awesome.min.css"} rel="stylesheet"/>

                
            </Helmet>
        );
    }
    

    render(){
        const adminPaths = [
            AllRoute.adminActivityLog, AllRoute.adminFunction, AllRoute.adminFunctionDtl,
            AllRoute.adminPlatform, AllRoute.adminPlatformDtl,
            AllRoute.adminSlider, AllRoute.adminSliderDtl,
            AllRoute.adminProject, AllRoute.adminProjectDtl,
            AllRoute.adminQuestionnaire, AllRoute.adminQuestionnaireFreeText, AllRoute.adminQuestionnaireRadio,
            AllRoute.adminUserProject, AllRoute.adminUserProjectDtl,
            AllRoute.adminReportSummary, AllRoute.adminReportDetail,
            AllRoute.adminTheme, AllRoute.adminThemeDtl,
            AllRoute.adminUsers, AllRoute.adminUsersDtl,
        ];
        const rootPaths = [AllRoute.root, AllRoute.detailProject, AllRoute.savedProject, AllRoute.appliedProject];
        return(
            <Routes>
                {adminPaths.map((p) => <Route key={p} path={p} element={this.admin()} />)}
                {rootPaths.map((p) => <Route key={p} path={p} element={this.root()} />)}
            </Routes>
        )
    }
}

export default Head;