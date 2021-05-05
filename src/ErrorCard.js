import './ErrorCard.css';

export default function ErrorCard(props) {
    return (<div className="card">
                <h1 className="card-title">Oops! Availability Check Failed</h1>
                    <p>
                        Kindly Reload the page or check after some time
                    </p>
                    <a href="https://selfregistration.cowin.gov.in">Check Availability Here</a>   
            </div>);
  }