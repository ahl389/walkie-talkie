import React, {Component} from 'react';
import './App.css';

const { Device } = require('twilio-client');

class App extends Component {
  constructor(props) {
    super(props)

    this.state={
      identity: '',
      status: '',
      ready: false,
      authorized: false,
      password: ''
    }

    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.onChangeUpdateState = this.onChangeUpdateState.bind(this);
    this.typePassword = this.typePassword.bind(this);
    this.authorize = this.authorize.bind(this);
    this.setup = this.setup.bind(this);
  }

  componentDidMount() {
    const device = new Device();

    this.setState({
      device: device
    })

    device.on('incoming', connection => {
      connection.accept();

      this.setState({
        status: "call incoming"
      });
    });

    device.on('ready', device => {
      this.setState({
        status: "online",
        ready: true
      });
    });

    device.on('connect', device => {
      this.setState({
        status: "connected"
      });
    });

    device.on('disconnect', device => {
      this.setState({
        status: "disconnected"
      });
    });
  }

  connect() {
    this.state.device.connect({recipient: this.state.recipient})
    this.setState({status: 'calling'})
  }

  disconnect(recipient) {
    this.state.device.disconnectAll()
  }

  setup(event) {
    event.preventDefault();

    fetch(`${process.env.REACT_APP_API_BASE}/token?identity=${this.state.identity}`)
      .then(response => response.json())
      .then(data => {
        this.state.device.setup(data.accessToken);
        this.state.device.audio.incoming(false);
        this.state.device.audio.outgoing(false);
        this.state.device.audio.disconnect(false);

        this.setState({
          status: 'online',
          recipient: this.state.identity == 'friend1' ? 'friend2' : 'friend1'
        });
      })
      .catch(err => console.log(err));
  }

  onChangeUpdateState(event) {
    this.setState({
      identity: event.target.value
    })
  }

  typePassword(event) {
    this.setState({
      password: event.target.value
    })
  }

  authorize(event) {
    event.preventDefault();

    if (this.state.password == process.env.REACT_APP_SECRET) {
      this.setState({
        authorized: true,
        status: 'offline'
      })
    } else {
      this.setState({
        status: 'unauthorized'
      })
    }
  }

  render() {
    return (
      <div className="App">
        {
          this.state.authorized
          ? <div>
            { 
              this.state.ready
              ? <button 
                  onMouseDown={this.connect} 
                  onMouseUp={this.disconnect}>
                    Press to Talk
                </button> 
              : <div>
                  <p>Enter your name to begin.</p>
                  <form onSubmit={this.setup}>
                    <input 
                      type="text" 
                      value={this.state.identity}
                      onChange={this.onChangeUpdateState}
                      placeholder="What's your name?"></input>
                    <input type="submit" value="Begin Session"></input>
                  </form>
                </div>
            }
            </div>
          : <form onSubmit={this.authorize}>
              <input 
                type="password" 
                value={this.state.password}
                onChange={this.typePassword}
                placeholder="Password"></input>
              <input type="submit" value="Enter Password"></input>
            </form>
        }
        <p>{ this.state.status }</p>


        
       
      </div>
    );
  }
}

export default App;
