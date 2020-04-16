const assert = require('assert')

class MarketMakersRepo {
  lmsrMarketMaker
  collateralToken

  constructor(contracts) {
    assert(contracts, '"contracts" is required')

    this.lmsrMarketMaker = contracts.lmsrMarketMaker
    this.collateralToken = contracts.collateralToken
  }

  getAddress = async () => {
    return this.lmsrMarketMaker.address
  }

  getCollateralToken = async () => {
    return this.collateralToken
  }

  conditionIds = async (index) => {
    return this.lmsrMarketMaker.conditionIds(index)
  }

  owner = async () => {
    return this.lmsrMarketMaker.owner()
  }

  funding = async () => {
    return this.lmsrMarketMaker.funding()
  }

  stage = async () => {
    return this.lmsrMarketMaker.stage()
  }

  close = async (from) => {
    return this.lmsrMarketMaker.close({ from })
  }

  calcNetCost = async (outcomeTokenAmounts) => {
    return this.lmsrMarketMaker.calcNetCost(outcomeTokenAmounts)
  }

  calcMarginalPrice = async (outcomeIndex) => {
    return this.lmsrMarketMaker.calcMarginalPrice(outcomeIndex)
  }

  trade = async (tradeAmounts, collateralLimit, from) => {
    return this.lmsrMarketMaker.trade(tradeAmounts, collateralLimit, { from })
  }

  // ...
}

export default MarketMakersRepo
