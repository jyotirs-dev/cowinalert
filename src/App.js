import React from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import ErrorCard from './ErrorCard';
import Telegram from './Telegram';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      apiData: "No Slots Available",
      available:false,
      error:false     
  }
  }

  componentDidMount(){
    const DateVar = this.getTomorrowDate();
    console.log("test1",DateVar);
    this.getSlotsForDate(DateVar);
    this.interval = setInterval(() => this.getSlotsForDate(DateVar), 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  sendTelegram = async (strarr)=>{
  
    const helpLink = (`%0AVisit https://selfregistration.cowin.gov.in`);
    const sendMessageNew = (i,params)=>{
      setTimeout(()=> { return axios(params); }, 2000*i);
    }
    for(let i=0; i< strarr.length;i++) {
      let config = {
        method: 'get',
        url: process.env.REACT_APP_SEND_MSG + strarr[i] + helpLink
      };
      sendMessageNew(i,config)
  }
  }

  updateState = ()=>{
    this.setState(state => ({
      apiData: "Slots Now Available",
      available:true
    }));
  }

  updateErrorState = (err)=>{
    this.setState(state => ({
      error: true,
    }));
  }

  getTomorrowDate = ()=>{
    let currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    let day = currentDate.getDate()
    let month = currentDate.getMonth() + 1
    let year = currentDate.getFullYear()
    const tomorrowDate = day + "/" + month + "/" + year;
    return tomorrowDate;
  }

  getSlotsForDate = async (DATE)=> {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=319&date='+DATE,
        headers: {
            'accept': 'application/json'
        }
    };

    await axios(config)
        .then( (slots)=> {
          const arrmsg = [];
            const centers = slots.data.centers;
            for(var i in centers){
              var centerData = centers[i];
              var name =  centerData["name"];
              // var centerId = centerData["center_id"];
              for(var j in centerData["sessions"]){
                  var session = centerData["sessions"][j];
                  var avail = session["available_capacity"];
                  var date  = session["date"];
                  var age = session["min_age_limit"];
                  // var slot = session["slots"][0];
                  // var sessionId = session["session_id"];
                  
                  if(age === 18 && avail > 0){
                      console.log(`${avail} vaccine available for age ${age}-44 at ${name} on ${date}`);
                      let strMsg = `${avail} vaccine available for age ${age}-44 at ${name} on ${date}`;
                      arrmsg.push(strMsg);
                    }
                }
              }
    
              console.log("checking",arrmsg);
            if(age === 18 && avail > 0) {
                this.sendTelegram(arrmsg);
                this.updateState();
                clearInterval(this.interval);
            }
        })
        .catch(error=>{
            console.log(error);
            this.updateErrorState(error);
        });
  }

  clickHandle = ()=>{
    console.log("clicked"); 
    window.open("https://telegram.me/joinchat/8ryMJj9LN6k0OTg9",'_self' );
  }

  render(){
    const slotsAvailable = 
    <div>
    <h1>Slots Now Available</h1>
    <p>Visit <a className ="App-link" href="https://selfregistration.cowin.gov.in">https://selfregistration.cowin.gov.in</a></p>
    </div>

    const slotsUnAvailable = 
    <div>
    <h1>No Slots Available</h1>
    <p>Keep Checking Screen Every Minute</p>
    <Spinner/>
    <p><small>We will alert you, Join 👇 our Telegram Channel</small></p>
    </div>
    // console.log(window.innerHeight);
    const viewHeight = window.innerHeight;
    return (
      
      <div style={{height:viewHeight}} className="App">
        <header className="App-header">
          Mandsaur city Cowin 18+ vaccination slots availability check.
        </header>
        <div className="App-body">
          {!this.state.error && (this.state.available? slotsAvailable : slotsUnAvailable)}
          {this.state.error && <ErrorCard/>}
          {!this.state.error && <Telegram onclick={()=> this.clickHandle}/>}
        </div>
        <footer className="App-footer">
          <div className="footer-right">Made with ❤️ in India - <a href="https://github.com/jyotirs-dev">By Jyotiraditya Singh Solanki</a></div>
        </footer>
      </div>
    );
  }
}

export default App;
