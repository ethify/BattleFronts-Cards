import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";
import { ApiService } from "services";

class Staking extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
    this.state = {
      form: {
        username: "",
        key: "",
        error: "",
      },
      buyToken1Loading: false,
      buyToken2Loading: false,
    };
  }
  // Runs on every keystroke to update the React state
  handleChange = (event) => {
    const { name, value } = event.target;
    const { form } = this.state;

    this.setState({
      form: {
        ...form,
        [name]: value,
        error: "",
      },
    });
  };

  buyToken2 = () => {
    console.log("Entered player 2");

    const { setUser } = this.props;
    console.log(setUser);

    setUser({ staking_done: true });
  };

  buyToken1 = () => {
    console.log("Entered player 1");

    const { setUser } = this.props;
    console.log(setUser);

    setUser({ staking_done: true });
  };

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  render() {
    // Extract data from state
    const { form, error, buyToken1Loading, buyToken2Loading } = this.state;
    return (
      <div className="Staking">
        <div className="description">
          Please provide the details of staking you want in this game
        </div>
        <div name="form">
          <div className="field">
            <label>Stake Amount</label>
            <input
              type="number"
              name="username"
              value={form.username}
              placeholder="Enter stake amount"
              onChange={this.handleChange}
              required
              autoComplete="off"
            />
          </div>
          <div className="field form-error">
            {error && <span className="error">{error}</span>}
          </div>
          <div className="bottom">
            <Button
              type="submit"
              className="green"
              loading={buyToken1Loading}
              onClick={this.buyToken1}
            >
              {"Player 1"}
            </Button>
            <Button
              type="submit"
              className="green"
              loading={buyToken2Loading}
              onClick={this.buyToken2}
            >
              {"Player 2"}
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
