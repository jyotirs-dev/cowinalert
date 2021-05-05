import React from 'react';
import axios from 'axios';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {apiData: null}
  }

  componentDidMount(){
    this.getSlotsForDate();
  }

   getSlotsForDate = (DATE)=> {
    let config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=319&date=06-05-2021',
        headers: {
            'accept': 'application/json'
        }
    };

    axios(config)
        .then(function (slots) {
            const centers = slots.data.centers;
            const sessions = centers.map(centre=>centre.sessions).flat();
            const validSlots = sessions.filter(session=> session.min_age_limit===18 && session.available_capacity>0)
            console.log("test",validSlots)
            if(validSlots.length > 0) {
                alert("Slots Available");
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}
  render(){
    return (
      <div className="App">
        <header className="App-header">
          {this.state.apiData}
        </header>
      </div>
    );
  }
}

export default App;
