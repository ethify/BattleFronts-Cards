import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";

import { getAccount, buyToken } from "../../services/conditionalTokens/Web3Service";

const markets = require("../../services/conditionalTokens/config.local.json");

class Staking extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
    this.state = {
      buyToken1Loading: false,
      buyToken2Loading: false,
      amount: 5,
      account: null,
    };
  }
  // Runs on every keystroke to update the React state
  handleChange = (event) => {
    const { value } = event.target;

    this.setState({
      amount: value,
    });
  };

  handleBuyToken = async () => {

    await buyToken(this.state.account, this.state.amount)

    const { setUser } = this.props;
    console.log(setUser);

    setUser({ staking_done: true });
  }

  async componentDidMount() {
    console.log(process.env);

    let account = await getAccount();
    console.log("account is ", account);

    this.setState({
      account: account[0],
    });
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  render() {
    // Extract data from state
    const { amount, buyToken1Loading } = this.state;
    return (
      <div className="Staking">
        <div className="description">Who will win this game?</div>
        <div name="form">
          <div className="field">
            <label>Stake Amount on your Victory</label>
            <input
              type="number"
              name="username"
              value={amount}
              placeholder="Enter stake amount"
              onChange={this.handleChange}
              required
              autoComplete="off"
            />
          </div>
          {/* <div className="field form-error">
            {error && <span className="error">{error}</span>}
          </div> */}
          <div className="bottom">
            <Button
              type="submit"
              className="green"
              loading={buyToken1Loading}
              onClick={(e) => this.handleBuyToken("player1")}
            >
              {"Stake"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

// Map all state to component props (for redux to connect)
const mapStateToProps = (state) => state;

// Map the following action to props
const mapDispatchToProps = {
  setUser: UserAction.setUser,
};

// Export a redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(Staking);
