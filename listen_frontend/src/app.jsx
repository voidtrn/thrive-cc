import React, {
  useEffect, useState
} from 'react';
import { env, securityData } from './helpers/globalHelper';

import Footer from './views/townhall/footer.jsx';
import Header from './views/townhall/header.jsx';
import LeaderPhoto from './views/townhall/leader_photo.jsx';
import FormQuestion from './views/townhall/form_question.jsx';

function App() {

  return (
    <div id="page-top" >

      <Header />
      <section className="page-alt4eng-header">
        <div className='container'>
          <div className="row mt-4">
            <div className="col-md-12 text-center">
              <img src={env.assets + "_newdialogue/images/ask 72 leaders 1.png"} />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-12 text-center">
              <img src={env.assets + "_newdialogue/images/logo-size-large.png"} className="img-fluid" />
            </div>
          </div>
        </div>
      </section>

      <FormQuestion />
      <Footer />

    </div>

  );
}

export default App;
