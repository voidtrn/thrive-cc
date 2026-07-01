import React, { 
  Suspense, useEffect, useState
} from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import routeAll from './helpers/route';
import Layout from './views/user/shared/master';
import LayoutAdmin from './views/admin/shared/adminMaster';
import { LoadingPage } from './components/Loading';
import { securityData } from './helpers/globalHelper';
// import { isMobile, isDesktop } from 'react-device-detect';


function App(props) {
  // const [mobile, setMobile] =  useState(isMobile)
  const adminLevelDatabase = props.adminLevel;
  
  useEffect(()=>{
    if(securityData.Security_getPlatformId()){
      redirectNotFound()
      // maintenanceMode()
    }
  },[])

  const [loading, setLoading] = useState(true)

  const location = useLocation();

  const showLoading = (val)=>{
    // if(val===false){
      setLoading(val)
    // }
  }

  //filter user only in dev (to prevent another user access dev)
  // const filterUser = ()=>{
  //   const getUrl = window.location.href;
  //   if(!getUrl.includes('error')){
  //     if(getUrl.includes("dev")||getUrl.includes("localhost")){
  //       const listUser = [1000470279,1000451879,1000501855,1000209913,1000494053,1000173608,1000359749,1000215122]
  //       if(listUser.findIndex(v=>v==securityData.Security_UserId()) === -1){
  //         if(confirm('you go to the wrong link, please go to https://learn.culture.pmicloud.biz/')){
  //           window.location.href = 'https://learn.culture.pmicloud.biz/'
  //         }else{
  //           window.location.href = routeAll.routesComponent.notFound.path
  //         }
  //       }
  //     }
  //   }
  // }
  //

  const renderRoute = (value, idx)=>{
      return(
        <Route 
          key={idx} 
          name={value.name} 
          path={value.path} 
          exact={value.exact}
          
          render={(props) => (
              <value.component {...props} pageName={value.pageName} adminLevel={adminLevelDatabase} name={value.name} loading={showLoading} setLoading={setLoading}/>
        )} />
      ) 
  }

  const getCurrentPathWithoutLastPart = () => {
      const isi = location.pathname.slice(0, location.pathname.lastIndexOf('/'))
      return isi
  }

  const redirectNotFound = () =>{
    let allRoutePath = []
    let answer = ""
    Object.values(routeAll).map((value,idxParentRoute,array)=>{
        Object.values(array[idxParentRoute]).map((v)=>{
          if(v.parentPath){
            allRoutePath = [...allRoutePath, v.parentPath]
          }else{
            allRoutePath = [...allRoutePath, v.path]
          }
        })
      }
    )
    if(getCurrentPathWithoutLastPart()==='/training_team'){
      answer = allRoutePath.includes(getCurrentPathWithoutLastPart())
    }else{
      answer = allRoutePath.includes(location.pathname)
    }
    
    if(!answer){
      window.location.href = routeAll.routesComponent.notFound.path
    }
  }

  return (
    <Switch>
      <LoadingPage loading={loading}>
      {Object.values(routeAll).map((value,idxParentRoute,array)=>
          <Route path={idxParentRoute===0?'/:path?' : idxParentRoute===1 ? '/admin/:path?' : idxParentRoute===2 ?'/error/:path?' : idxParentRoute===3 ?'/report/:path?' : idxParentRoute===4 ?'/viewall/:path?':idxParentRoute===5? '/training_team/:id':null} key={idxParentRoute} exact>
            <Suspense fallback={
              <LoadingPage loading={true}/>
            }>
              {
                idxParentRoute===0 || idxParentRoute===4 || idxParentRoute===5?
                  <Layout adminLevel={adminLevelDatabase} homePath={routeAll.routesUser.home.path} loading={showLoading} setLoading={setLoading}>
                    {Object.values(array[idxParentRoute]).filter(list=>list.adminLevel <= adminLevelDatabase).map((value,idxChildren)=>
                      renderRoute(value,idxChildren)
                    )}
                  </Layout>
                :
                idxParentRoute===1 || idxParentRoute === 3?
                  <LayoutAdmin adminLevel={adminLevelDatabase} loading={showLoading} setLoading={setLoading}>
                    {Object.values(array[idxParentRoute]).map((value,idxChildren)=>
                      renderRoute(value,idxChildren)
                    )}
                  </LayoutAdmin>
                :
                idxParentRoute===2?
                  Object.values(array[idxParentRoute]).map((value,idxChildren)=>
                    renderRoute(value,idxChildren)
                  )
                :
                null
              }
            </Suspense>
          </Route>
      )}
      </LoadingPage>
    </Switch>
  );
}

export default App;
