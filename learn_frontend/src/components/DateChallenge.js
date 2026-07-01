import React, { useCallback, useEffect, useState } from 'react';
import { css } from "@emotion/react";
import BeatLoader from "react-spinners/BeatLoader";
import { env, securityData } from '../helpers/globalHelper';
import axiosLibrary from '../helpers/axiosLibrary';
import { isMobile } from 'react-device-detect';
import { useHistory } from 'react-router';

import routeAll from '../helpers/route';

export function YesterdayNotAnswer(id, textDay, challengeType) {

    const history = useHistory();
    const toAnswerQuiz = useCallback(async (dateId) => {
        const md5Id = await axiosLibrary.getmd5FromBackend(dateId)
        //history.push(routeAll.routesUser.AnswerQuiz.path + "?dateId=" + md5Id);

        if(challengeType == 3){
            window.open("answer-quiz3?dateId="+md5Id,"_self");
        }
        else if(challengeType == 4){
            window.open("answer-quiz4?dateId="+md5Id,"_self");
        }
        else{
            window.open("answer-quiz?dateId="+md5Id,"_self")
        }
        
    })

    return (
        <div className="col m-2 text-center " >
            <div className="frame1-menit1-hari-landing-page-cell color-white-dark border-blue  cursor-pointer" onClick={() => toAnswerQuiz(id)}>
                <span className="frame1-menit1-hari-landing-page-text031 color-blue mt-3">
                    {textDay}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  color-blue mt-2 mb-2">
                    {id}
                </span>
            </div>
        </div>
    );
}

export function TodayNotAnswer(id, textDay, challengeType) {

    const history = useHistory();
    const toAnswerQuiz = useCallback(async (dateId) => {
        const md5Id = await axiosLibrary.getmd5FromBackend(dateId)
        //history.push(routeAll.routesUser.AnswerQuiz.path + "?dateId=" + md5Id);

        
        if(challengeType == 3){
            window.open("answer-quiz3?dateId="+md5Id,"_self");
        }
        else if(challengeType == 4){
            window.open("answer-quiz4?dateId="+md5Id,"_self");
        }
        else{
            window.open("answer-quiz?dateId="+md5Id,"_self")
        }
    })
    return (
        <div className="col m-2 text-center " onClick={() => toAnswerQuiz(id)}>
            <div className="frame1-menit1-hari-landing-page-cell bg-yellow color-white-dark border-blue  cursor-pointer-transparent">
                <span className="frame1-menit1-hari-landing-page-text031 color-blue mt-3">
                    {textDay}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  color-blue mt-2 mb-2">
                    {id}
                </span>
            </div>
        </div>

    );
}

export function TodayAnswer(id, totalPoint, textDay, textPoint, challengeType) {

    const history = useHistory();
    const toAnswerQuiz = useCallback(async (dateId) => {
        const md5Id = await axiosLibrary.getmd5FromBackend(dateId)
        //history.push(routeAll.routesUser.AnswerQuiz.path + "?dateId=" + md5Id);

        
        if(challengeType == 3){
            window.open("answer-quiz3?dateId="+md5Id,"_self");
        }
        else if(challengeType == 4){
            window.open("answer-quiz4?dateId="+md5Id,"_self");
        }
        else{
            window.open("answer-quiz?dateId="+md5Id,"_self")
        }
    })
    
    return (
        <div className="col m-2 text-center " onClick={() => toAnswerQuiz(id)}>
            <div className="frame1-menit1-hari-landing-page-cell bg-blue border-white-dark  cursor-pointer-transparent">
                <span className="frame1-menit1-hari-landing-page-text031 color-white-dark mt-3">
                    {textDay}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  color-white mt-2 mb-2">
                    {id}
                </span>
                <div className="frame1-menit1-hari-landing-page-label1">
                    <span className="frame1-menit1-hari-landing-page-text033 color-blue">
                        {totalPoint} {textPoint}
                    </span>
                </div>
            </div>
        </div>

    );
}

export function AnsweredToday(id, totalPoint, textDay, textPoint, challengeType) {
    const history = useHistory();
    const toAnswerQuiz = useCallback(async (dateId) => {
        const md5Id = await axiosLibrary.getmd5FromBackend(dateId)
        //history.push(routeAll.routesUser.AnswerQuiz.path + "?dateId=" + md5Id);

        
        if(challengeType == 3){
            window.open("answer-quiz3?dateId="+md5Id,"_self");
        }
        else if(challengeType == 4){
            window.open("answer-quiz4?dateId="+md5Id,"_self");
        }
        else{
            window.open("answer-quiz?dateId="+md5Id,"_self")
        }
    })
    return (
        <div className="col m-2 text-center " onClick={() => toAnswerQuiz(id)}>
            <div className="frame1-menit1-hari-landing-page-cell bg-green cursor-pointer-transparent">
                <span className="frame1-menit1-hari-landing-page-text031 color-white mt-3">
                    {textDay}
                </span>
                <span className="frame1-menit1-hari-landing-page-text032  color-white mt-2 mb-2">
                    {id}
                </span>
                <div className="frame1-menit1-hari-landing-page-label1">
                    <span className="frame1-menit1-hari-landing-page-text033 color-blue">
                        {totalPoint} {textPoint}
                    </span>
                </div>
            </div>
        </div>

    );
}
export function Tomorrow() {
    return (

        <div className="col m-2 text-center">
            <div className="frame1-menit1-hari-landing-page-cell bg-white-dark border-white-dark">
                <span className="frame1-menit1-hari-landing-page-text032  color-white">
                    <img width="40px" style={{ marginTop: "25px", marginBottom: "25px" }} src={env.assets + "landingpage/assets/images/hut/mdi_lock.png"} />
                </span>
            </div>
        </div>
    );
}
