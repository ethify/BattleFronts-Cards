const assert = require('assert')

class ConditionalTokensRepo {

  constructor(contracts) {
    assert(contracts, '"contracts" is required')

    this.conditionalTokens = contracts.conditionalTokens
  }

  balanceOf = async (account, positionId) => {
    return this.conditionalTokens.balanceOf(account, positionId)
  }

  getOutcomeSlotCount = async (id) => {
    return this.conditionalTokens.getOutcomeSlotCount(id)
  }

  getCollectionId = async (parentCollectionId, conditionId, indexSet) => {
    return this.conditionalTokens.getCollectionId(parentCollectionId, conditionId, indexSet)
  }

  payoutDenominator = async (conditionId) => {
    return this.conditionalTokens.payoutDenominator(conditionId)
  }

  payoutNumerators = async (conditionId, outcomeIndex) => {
    return this.conditionalTokens.payoutNumerators(conditionId, outcomeIndex)
  }

  isApprovedForAll = async (account, lmsrMarketMakerAddress) => {
    return this.conditionalTokens.isApprovedForAll(account, lmsrMarketMakerAddress)
  }

  setApprovalForAll = async (lmsrMarketMakerAddress, approved, from) => {
    return this.conditionalTokens.setApprovalForAll(lmsrMarketMakerAddress, approved, { from })
  }

  reportPayouts = async (questionId, payouts, from) => {
    return this.conditionalTokens.reportPayouts(questionId, payouts, { from })
  }

  redeemPositions = async (
    collateralAddress,
    parentCollectionId,
    marketConditionId,
    indexSets,
    from,
  ) => {
    return this.conditionalTokens.redeemPositions(
      collateralAddress,
      parentCollectionId,
      marketConditionId,
      indexSets,
      { from },
    )
  }

  // ...
}

export default ConditionalTokensRepo
