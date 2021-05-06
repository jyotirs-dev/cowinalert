import './Telegram.css';
import telegramimg from './assets/telegram.png';

export default function Telegram(props) {
    return (<div onClick={props.onclick()} className="card-body">
                <div className="card-body-icon"><img width="30px" alt="" src={telegramimg}/></div>
                <div className="card-body-text">U18 MDS Vaccination Updates</div>
            </div>);
  }