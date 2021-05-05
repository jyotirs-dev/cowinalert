import React from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import ErrorCard from './ErrorCard';
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

  getSlotsForDate = (DATE)=> {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=319&date='+DATE,
        headers: {
            'accept': 'application/json'
        }
    };

    axios(config)
        .then( (slots)=> {
            const centers = slots.data.centers;
            const sessions = centers.map(centre=>centre.sessions).flat();
            // console.log("test",sessions);
            let validSlots = sessions.filter(session=> session.min_age_limit===18 && session.available_capacity>0)
            console.log("checking",validSlots);
            // validSlots.push(0);
            if(validSlots.length > 0) {
                this.updateState();
                alert("Slots Available");
                clearInterval(this.interval);
            }
        })
        .catch(error=>{
            console.log(error);
            this.updateErrorState(error);
        });
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
    <p><small>We will alert you</small></p>
    </div>

    return (
      <div className="App">
        <header className="App-header">
          Mandsaur Cowin 18+ availability Check
        </header>
        <div className="App-body">
          {!this.state.error && (this.state.available? slotsAvailable : slotsUnAvailable)}
          {this.state.error && <ErrorCard/>}
        </div>
      </div>
    );
  }
}

export default App;
