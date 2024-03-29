import React, { Component } from "react";

class LeaderboardContainer extends Component {
  constructor() {
    super();
    this.state = {
      leaderboard: [],
      celebrities: [],
      images: {},
    };

    this.refreshLeaderboard = this.refreshLeaderboard.bind(this);
    this.transformStateToLeaderboard = this.transformStateToLeaderboard.bind(this);
    this.renderLeaderboardItem = this.renderLeaderboardItem.bind(this);
    this.attachLeaderboardImages = this.attachLeaderboardImages.bind(this);
    this.getS3Url = this.getS3Url.bind(this);
  }

  transformStateToLeaderboard(state) {
    var leaderboard = [];
    for (var i = 0; i < state.length; i++) {
      var item = {
        key: i + 1,
        id: state[i][0],
        name: state[i][0].replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(name) { return name.toUpperCase()}),
        carnivalScore: state[i][1].carnivalSQUARE,
        circuitScore: state[i][1].circuitGROUNDS,
        neonScore: state[i][1].neonGARDEN,
      };
      leaderboard.push(item);
    }
    return leaderboard;
  }

  attachLeaderboardImages(leaderboard) {
    for (var i = 0; i < leaderboard.length; i++) {
      var item = leaderboard[i];
      fetch('/data/dynamo/totem/' + item.id)
        .then(res => res.json())
        .then(json => {
          var images = this.state.images;
          images[json.totem_id] = this.getS3Url(json);
          this.setState({images: images});
        });
    }
  }

  renderLeaderboardItem(item) {

    return (
      <div key={item.key}>
        <div className="leaderboard-item-key">{item.key}</div>
        <li>
          <img className="leaderboard-item-image" src={this.state.images[item.id]}/>
          <div className="leaderboard-item-data">
            <div className="leaderboard-item-data-name">{item.name}</div>
            <div className="leaderboard-item-data-scores">
              <div>
                <div className="leaderboard-item-data-scores-stage">carnivalSQUARE</div>
                <div>{item.carnivalScore}</div>
              </div>

              <div>
                <div className="leaderboard-item-data-scores-stage">circuitGROUNDS</div>
                <div>{item.circuitScore}</div>
              </div>

              <div>
                <div className="leaderboard-item-data-scores-stage">neonGARDEN</div>
                <div>{item.neonScore}</div>
              </div>
            </div>
          </div>
        </li>
      </div>
    );
  }

  getS3Url(item) {
    return "https://s3.amazonaws.com/" + item.s3_bucket + "/" + item.s3_key;
  }

  refreshLeaderboard() {
    console.log("Refreshing leaderboard...");

    fetch('/data/dynamo/leaderboard')
      .then(response => response.json())
      .then(json => {
        var leaderboard = this.transformStateToLeaderboard(JSON.parse(json.leaderboard_state));
        this.attachLeaderboardImages(leaderboard);
        this.setState({leaderboard: leaderboard});
      });
    fetch('/data/auth/celebrities/invalid')
      .then(res => res.json())
      .then(json => this.setState({celebrities: json}));    
  }

  componentWillMount() {
    this.refreshLeaderboard();
  }

  componentDidMount() {
    this.timer = setInterval(() => this.refreshLeaderboard(), 5000);
  }

  render() {
    return (
      <div id="leaderboard-container">

        <div id="deeplens-window" />
        <div id="leaderboard">
          <div id="leaderboard-title">Leaderboard</div>
          <ol id="leaderboard-list">
              {
                this.state.leaderboard.length > 0 
                ? this.state.leaderboard.map((item) => this.renderLeaderboardItem(item))
                : null
              }
          </ol>
        </div>
      </div>
    );
  } 
}

export default LeaderboardContainer;
