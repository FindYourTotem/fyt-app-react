import React, { Component } from "react";

import { FytLogo } from "../Bundler";

class Root extends Component {
  constructor() {
    super();
    this.state = {
      leaderboard: [],
    };

    this.transformStateToLeaderboard = this.transformStateToLeaderboard.bind(this);
    this.renderLeaderboardItem = this.renderLeaderboardItem.bind(this);
  }

  transformStateToLeaderboard(state) {
    var leaderboard = [];
    for (var i = 0; i < state.length; i++) {
      var item = {
        key: i + 1,
        name: state[i][0],
        kineticScore: state[i][1].kineticFIELD,
        circuitScore: state[i][1].circuitGROUNDS,
        neonScore: state[i][1].neonGARDEN,
      };
      leaderboard.push(item);
    }
    return leaderboard;
  }

  renderLeaderboardItem(item) {
    return (
      <div key={item.key}>
        <div className="leaderboard-item-key">{item.key}</div>
        <li>
          <div className="leaderboard-item-image">
            {/* TODO: Get totem photo from API */}
          </div>
          <div className="leaderboard-item-data">
            <div className="leaderboard-item-data-name">{item.name}</div>
            <div className="leaderboard-item-data-scores">
              <div>
                <div className="leaderboard-item-data-scores-stage">kineticFIELD</div>
                <div>{item.kineticScore}</div>
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

  componentWillMount() {
    fetch('/data/dynamo/leaderboard')
      .then(response => response.json())
      .then(json => {
        var leaderboard = this.transformStateToLeaderboard(JSON.parse(json.leaderboard_state));
        this.setState({leaderboard: leaderboard});
      });
  }

  render() {
    console.log(this.state.leaderboard);

    return (
      <div id="container">
        <div id="nav-bar">
          <FytLogo/>
        </div>
        <div id="leaflet-background-map"/>
        <div id="content">
          <div id="map-container">

          </div>
          <div id="leaderboard-container">
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
        </div>
      </div>
    );
  }
}

export default Root;
