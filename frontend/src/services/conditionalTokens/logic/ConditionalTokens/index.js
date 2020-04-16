import ConditionalTokensRepo from './ConditionalTokensRepo'
import loadContracts from '../contracts'

let conditionalTokensRepo
let lmsrAddressCache
let providerAccountCache

const resetConditionalTokensRepo = () => {
  conditionalTokensRepo = undefined
}

export const loadConditionalTokensRepo = async (web3, lmsrAddress, account) => {
  try {
    if (
      (account && account !== providerAccountCache) ||
      (lmsrAddress && lmsrAddress !== lmsrAddressCache)
    ) {
      resetConditionalTokensRepo()
    }
    if (!conditionalTokensRepo) {
      lmsrAddressCache = lmsrAddress
      providerAccountCache = account

      const contracts = await loadContracts(web3, lmsrAddress, account)
      conditionalTokensRepo = new ConditionalTokensRepo(contracts)
    }
    return conditionalTokensRepo
  } catch (err) {
    console.error(err)
    return null
  }
}
