import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";
import { ApiService } from "services";
import { loadConditionalTokensRepo } from "../../services/conditionalTokens/logic/ConditionalTokens";
import { loadMarketMakersRepo } from "../../services/conditionalTokens/logic/MarketMakers";
import BigNumber from "bignumber.js";
import { getAccount } from "../../services/conditionalTokens/Web3Service";
import {
  getConditionId,
  getPositionId,
} from "../../services/conditionalTokens/utils/markets";

const markets = require("../../services/conditionalTokens/config.local.json");

const MarketStage = {
  Running: 0,
  Paused: 1,
  Closed: 2,
};

class Staking extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
    this.state = {
      buyToken1Loading: false,
      buyToken2Loading: false,
      amount: 5,
      conditionalTokensRepo: null,
      marketMakersRepo: null,
      account: null,
      marketInfo: null,
    };
  }
  // Runs on every keystroke to update the React state
  handleChange = (event) => {
    const { value } = event.target;

    this.setState({
      amount: value,
    });
  };

  buyToken = async (pOption) => {
    if (pOption === "player1") {
      console.log("Entered player 1");

      await this.buyConditionalToken(0);

      const { setUser } = this.props;
      console.log(setUser);

      setUser({ staking_done: true });
    } else {
      console.log("Entered player 2");

      await this.buyConditionalToken(1);

      const { setUser } = this.props;
      console.log(setUser);

      setUser({ staking_done: true });
    }
  };

  getMarketInfo = async () => {
    return new Promise(async (resolve, reject) => {
      //if (!process.env.REACT_APP_ORACLE_ADDRESS) return
      const collateral = await this.state.marketMakersRepo.getCollateralToken();
      const conditionId = getConditionId(
        process.env.REACT_APP_ORACLE_ADDRESS,
        markets.markets[0].questionId,
        markets.markets[0].outcomes.length
      );
      const payoutDenominator = await this.state.conditionalTokensRepo.payoutDenominator(
        conditionId
      );

      const outcomes = [];
      for (
        let outcomeIndex = 0;
        outcomeIndex < markets.markets[0].outcomes.length;
        outcomeIndex++
      ) {
        const indexSet = (outcomeIndex === 0
          ? 1
          : parseInt(Math.pow(10, outcomeIndex).toString(), 2)
        ).toString();
        const collectionId = await this.state.conditionalTokensRepo.getCollectionId(
          `0x${"0".repeat(64)}`,
          conditionId,
          indexSet
        );
        const positionId = getPositionId(collateral.address, collectionId);
        const probability = await this.state.marketMakersRepo.calcMarginalPrice(
          outcomeIndex
        );
        const balance = await this.state.conditionalTokensRepo.balanceOf(
          this.state.account,
          positionId
        );
        const payoutNumerator = await this.state.conditionalTokensRepo.payoutNumerators(
          conditionId,
          outcomeIndex
        );

        const outcome = {
          index: outcomeIndex,
          title: markets.markets[0].outcomes[outcomeIndex].title,
          probability: new BigNumber(probability)
            .dividedBy(Math.pow(2, 64))
            .multipliedBy(100)
            .toFixed(2),
          balance: new BigNumber(balance).dividedBy(
            Math.pow(10, collateral.decimals)
          ),
          payoutNumerator: payoutNumerator,
        };
        outcomes.push(outcome);
      }

      const marketData = {
        lmsrAddress: markets.lmsrAddress,
        title: markets.markets[0].title,
        outcomes,
        stage: MarketStage[await this.state.marketMakersRepo.stage()],
        questionId: markets.markets[0].questionId,
        conditionId: conditionId,
        payoutDenominator: payoutDenominator,
      };

      this.setState({ marketInfo: marketData });
      resolve();
    });
  };

  buyConditionalToken = async (pSelectedOutcome) => {
    await this.getMarketInfo();

    console.log("marketinfo", this.state.marketInfo);

    const collateral = await this.state.marketMakersRepo.getCollateralToken();
    console.log("coolastrer", collateral);

    const formattedAmount = new BigNumber(this.state.amount).multipliedBy(
      new BigNumber(Math.pow(10, collateral.decimals))
    );

    const outcomeTokenAmounts = Array.from(
      { length: this.state.marketInfo.outcomes.length },
      (value, index) =>
        index === pSelectedOutcome ? formattedAmount : new BigNumber(0)
    );

    const cost = await this.state.marketMakersRepo.calcNetCost(
      outcomeTokenAmounts
    );

    console.log("cost", cost);

    const collateralBalance = await collateral.contract.balanceOf(
      this.state.account
    );

    console.log("collateralbal", collateralBalance);
    console.log("graterornot", cost.gt(collateralBalance));

    if (cost.gt(collateralBalance)) {
      await collateral.contract.deposit({
        value: formattedAmount.toString(),
        from: this.state.account,
      });
      await collateral.contract.approve(
        this.state.marketInfo.lmsrAddress,
        formattedAmount.toString(),
        {
          from: this.state.account,
        }
      );
    }

    const tx = await this.state.marketMakersRepo.trade(
      outcomeTokenAmounts,
      cost,
      this.state.account
    );
    console.log("trade transaction", { tx });
  };

  async componentDidMount() {
    console.log(process.env);

    let account = await getAccount();

    console.log("account is ", account);

    let conditionalTokensRepo = await loadConditionalTokensRepo(
      window.web3,
      markets.lmsrAddress,
      account[0]
    );
    let marketMakersRepo = await loadMarketMakersRepo(
      window.web3,
      markets.lmsrAddress,
      account[0]
    );

    this.setState({
      conditionalTokensRepo: conditionalTokensRepo,
      marketMakersRepo: marketMakersRepo,
      account: account[0],
    });
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  render() {
    // Extract data from state
    const { amount, buyToken1Loading, buyToken2Loading } = this.state;
    return (
      <div className="Staking">
        <div className="description">Who will win this game?</div>
        <div name="form">
          <div className="field">
            <label>Stake Amount</label>
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
              onClick={(e) => this.buyToken("player1")}
            >
              {"You"}
            </Button>
            <Button
              type="submit"
              className="green"
              loading={buyToken2Loading}
              onClick={(e) => this.buyToken("player2")}
            >
              {"Opponent"}
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
