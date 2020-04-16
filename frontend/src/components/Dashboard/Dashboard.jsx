import React, { Component } from "react";
import { connect } from "react-redux";
// Components
import { Button } from "components";
// Services and redux action
import { UserAction } from "actions";
import { ApiService } from "services";
import { loadConditionalTokensRepo } from '../../services/conditionalTokens/logic/ConditionalTokens';
import { loadMarketMakersRepo } from '../../services/conditionalTokens/logic/MarketMakers';
import BigNumber from 'bignumber.js'
import { getAccount } from '../../services/conditionalTokens/Web3Service';
import { getConditionId, getPositionId } from '../../services/conditionalTokens/utils/markets'

const MarketStage = {
  Running: 0,
  Paused: 1,
  Closed: 2,
}

const markets = require('../../services/conditionalTokens/config.local.json')

class Dashboard extends Component {
  constructor(props) {
    // Inherit constructor
    super(props);
    // State for form data and error message
    this.state = {
      amount: 0,
      conditionalTokensRepo: null,
      marketMakersRepo: null,
      account: null,
      marketInfo: null
    }
  }

  async componentDidMount() {


    let account = await getAccount()


    let conditionalTokensRepo = await loadConditionalTokensRepo(window.web3, markets.lmsrAddress, account)
    let marketMakersRepo = await loadMarketMakersRepo(window.web3, markets.lmsrAddress, account)

    this.setState({conditionalTokensRepo: conditionalTokensRepo, marketMakersRepo:marketMakersRepo, account:account})
  }

  componentWillUnmount() {}

  handleInput(e) {
      this.setState({amount: e.target.value})
  }

  getMarketInfo = async () => {
    if (!process.env.REACT_APP_ORACLE_ADDRESS) return
    const collateral = await this.state.marketMakersRepo.getCollateralToken()
    const conditionId = getConditionId(
      process.env.REACT_APP_ORACLE_ADDRESS,
      markets.markets[0].questionId,
      markets.markets[0].outcomes.length,
    )
    const payoutDenominator = await this.state.conditionalTokensRepo.payoutDenominator(conditionId)

    const outcomes = []
    for (let outcomeIndex = 0; outcomeIndex < markets.markets[0].outcomes.length; outcomeIndex++) {
      const indexSet = (outcomeIndex === 0
        ? 1
        : parseInt(Math.pow(10, outcomeIndex).toString(), 2)
      ).toString()
      const collectionId = await this.state.conditionalTokensRepo.getCollectionId(
        `0x${'0'.repeat(64)}`,
        conditionId,
        indexSet,
      )
      const positionId = getPositionId(collateral.address, collectionId)
      const probability = await this.state.marketMakersRepo.calcMarginalPrice(outcomeIndex)
      const balance = await this.state.conditionalTokensRepo.balanceOf(this.state.account, positionId)
      const payoutNumerator = await this.state.conditionalTokensRepo.payoutNumerators(
        conditionId,
        outcomeIndex,
      )

      const outcome = {
        index: outcomeIndex,
        title: markets.markets[0].outcomes[outcomeIndex].title,
        probability: new BigNumber(probability)
          .dividedBy(Math.pow(2, 64))
          .multipliedBy(100)
          .toFixed(2),
        balance: new BigNumber(balance).dividedBy(Math.pow(10, collateral.decimals)),
        payoutNumerator: payoutNumerator,
      }
      outcomes.push(outcome)
    }

    const marketData = {
      lmsrAddress: markets.lmsrAddress,
      title: markets.markets[0].title,
      outcomes,
      stage: MarketStage[await this.state.marketMakersRepo.stage()],
      questionId: markets.markets[0].questionId,
      conditionId: conditionId,
      payoutDenominator: payoutDenominator,
    }

    this.setState({marketInfo: marketData})
  }

  async buyConditionalToken() {
    const collateral = await this.state.marketMakersRepo.getCollateralToken()
    const formatedAmount = new BigNumber(this.state.amount).multipliedBy(
      new BigNumber(Math.pow(10, collateral.decimals)),
    )

    // const outcomeTokenAmounts = Array.from(
    //   { length: this.state.marketInfo.outcomes.length },
    //   (value, index) =>
    //     index === selectedOutcomeToken ? formatedAmount : new BigNumber(0),
    // )

    const outcomeTokenAmounts = [new BigNumber(12000), new BigNumber(0) ]

    const cost = await this.state.marketMakersRepo.calcNetCost("outcomeTokenAmounts")

    const collateralBalance = await collateral.contract.balanceOf(this.state.account)
    if (cost.gt(collateralBalance)) {
      await collateral.contract.deposit({ value: formatedAmount.toString(), from: this.state.account })
      await collateral.contract.approve(this.state.marketInfo.lmsrAddress, formatedAmount.toString(), {
        from: this.state.account,
      })
    }

    const tx = await this.state.marketMakersRepo.trade(outcomeTokenAmounts, cost, this.state.account)
    console.log({ tx })

    await this.getMarketInfo()
  }

  render() {
    return ( <div className="Dashboard">
      <input type="text" value={this.state.amount} onChange={this.handleInput}/>
      <input type="checkbox" value="Player 1" />
      <input type="checkbox" value="Player 2" />
      <button onClick={this.buyConditionalToken}>Buy</button>
    </div>
    )

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
