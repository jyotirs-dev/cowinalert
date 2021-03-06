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
      apiData: [],
      available:false,
      error:false,     
  }
  }

  componentDidMount(){
    const DateVar = this.getTomorrowDate();
    console.log("test1",DateVar);
    // this.sendTelegramTest();
    this.getSlotsForDate(DateVar);
    this.interval = setInterval(() => this.getSlotsForDate(DateVar), 5 * 1000);
  }

  createMsg = (arrmsg)=>{
    let str = "";
    arrmsg.forEach((msg)=>{
      str += `• ${msg}\n`
    });
    const header = "*⭐D2 Vaccine Alert Indore City⭐*\n\n"
    const helpLink = `Visit https://selfregistration.cowin.gov.in`;
    const msgstrnew = encodeURI(header + str + "\n" + helpLink);
    return msgstrnew;
  } 

  sendTelegram = async (strarr)=>{
    const sendMessage= (i,params)=>{
      setTimeout(()=> { return axios(params); }, 500*i);
    }
    let i,temp,chunk = 4;
      for(i=0; i<strarr.length; i+=chunk){
        temp = strarr.slice(i,i+chunk);
        const msgstrnew = this.createMsg(temp);
        let config = {
          method: 'get',
          url: process.env.REACT_APP_SEND_MSG + msgstrnew + "&parse_mode=markdown"
        };
        sendMessage(i,config);
        // axios(confignew)
        // .then( (res)=> {
        //   console.log(res);
        // })
        // .catch(error=>{
        //     console.log(error);
        // });
      }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkNewSlot = (arrmsg)=>{
    const equals = (a, b) =>
      a.length === b.length &&
      a.every((v, i) => v === b[i]);
    const newStringAdded = !(equals(this.state.apiData,arrmsg));
    return newStringAdded;
  }

  updateState = (arrmsg)=>{
    this.setState(state => ({
      apiData: arrmsg,
      available:true,
      error: false,
    }));
  }

  updateErrorState = (err)=>{
    this.setState(state => ({
      error: true,
    }));
    // setTimeout(() => window.location.reload(), 5 * 60 * 1000);
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
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=314&date='+DATE,
        headers: {
            'accept': 'application/json'
        }
    };

    await axios(config)
        .then( (slots)=> {
          let arrmsg = [];
          const centers = slots.data.centers;
          
            for(let i=0; i<centers.length; i++){
              let centerData = centers[i];
              let name =  centerData["name"];
              let pincode = centerData["pincode"];
              let sessions = centerData["sessions"];
              for(let j=0; j<sessions.length; j++){
                  let session = sessions[j];
                  let avail = session["available_capacity"];
                  let date  = session["date"];
                  let age = session["min_age_limit"];
                  let vaccine = session["vaccine"];
                  let dose1 = session["available_capacity_dose1"];
                  let dose2 = session["available_capacity_dose2"];
                  // var slot = session["slots"][0];
                  // var sessionId = session["session_id"];
                  
                  if(age === 18 && dose2 > 0  && vaccine === "COVAXIN"){
                      console.log("checking",session);
                      // console.log(`${avail} vaccine available for age ${age}-44 at ${name} on ${date}`);
                      let strMsg = `${avail} ${vaccine} available for age ${age}-44 at ${name} on ${date}.\n(Dose 1: ${dose1}, Dose 2: ${dose2})\nPinCode: ${pincode}\n`;
                      arrmsg.push(strMsg);
                    }
                }
              }

          if(this.state.error){
            this.setState(state => ({
              error: false,
            }));
          }
          // console.log("checking",arrmsg);
          if(arrmsg.length > 0) {
            const newSlotAvailable = this.checkNewSlot(arrmsg);
              if(newSlotAvailable){
                this.updateState(arrmsg);
                this.sendTelegram(arrmsg);
                
              }
              // clearInterval(this.interval);
              // setTimeout(() => window.location.reload(), 5 * 60 * 1000);  
          }else if(this.state.apiData.length>0){
              this.setState(state => ({
                apiData: [],
                available:false,
                error: false,
              }));
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
    {this.state.apiData.length>0 && this.state.apiData.map((str,idx)=>
      <p key={idx}><small>{str}</small></p>
    )}
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
          Indore city Cowin 18+ D2 vaccination slots availability check.
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
