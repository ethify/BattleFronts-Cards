import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";
import { ApiService } from "services";

import { getAccount } from "../../services/conditionalTokens/Web3Service";

class Login extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
    this.state = {
      form: {
        username: "",
        error: "",
      },
      isSigningIn: false,
      account: "",
    };
    // Bind functions
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Runs on every keystroke to update the React state
  handleChange(event) {
    const { name, value } = event.target;
    const { form } = this.state;

    this.setState({
      form: {
        ...form,
        [name]: value,
        error: "",
      },
    });
  }

  componentDidMount() {
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  // Handle form submission to call api
  async handleSubmit() {
    const account = await getAccount();
    this.setState({ account: account });
    // Extract `form` state
    const { form } = this.state;
    // Extract `setUser` of `UserAction` and `user.name` of UserReducer from redux
    const { setUser } = this.props;
    // Set loading spinner to the button
    this.setState({ isSigningIn: true });
    // Send a login transaction to the blockchain by calling the ApiService,
    // If it successes, save the username to redux store
    // Otherwise, save the error state for displaying the message
    return ApiService.login(form)
      .then(() => {
        setUser({ name: form.username });
      })
      .catch((err) => {
        this.setState({ error: err.toString() });
      })
      .finally(() => {
        if (this.isComponentMounted) {
          this.setState({ isSigningIn: false });
        }
      });
  }

  render() {
    // Extract data from state
    const { form, error, isSigningIn } = this.state;

    return (
      <div className="Login">
        <div className="title">Elemental Battles - Made By Ethify Labs</div>
        <div className="description">
          Please use the Account Name and Private Key generated in the previous
          page to log into the game.
        </div>
        <div className="field">
          <label>Account name</label>
          <input
            type="text"
            name="username"
            value={form.username}
            placeholder="Enter your name"
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
            className="green"
            loading={isSigningIn}
            onClick={this.handleSubmit}
          >
            {"CONFIRM"}
          </Button>
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
export default connect(mapStateToProps, mapDispatchToProps)(Login);
