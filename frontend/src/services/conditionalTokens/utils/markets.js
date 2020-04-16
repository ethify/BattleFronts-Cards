import Web3 from 'web3'

export const getConditionId = (
  oracleAddress,
  questionId,
  outcomeSlotCount,
) => {
  return Web3.utils.soliditySha3(
    { t: 'address', v: oracleAddress },
    { t: 'bytes32', v: questionId },
    { t: 'uint', v: outcomeSlotCount },
  )
}

export const getPositionId = (collateralToken, collectionId) => {
  return Web3.utils.soliditySha3(
    { t: 'address', v: collateralToken },
    { t: 'bytes32', v: collectionId },
  )
}
