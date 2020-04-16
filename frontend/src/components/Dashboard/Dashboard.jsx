import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";
import { ApiService } from "services";

class Dashboard extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return <div className="Dashboard"></div>;
  }
}

// Map all state to component props (for redux to connect)
const mapStateToProps = (state) => state;

// Map the following action to props
const mapDispatchToProps = {
  setUser: UserAction.setUser,
};

// Export a redux connected component
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
