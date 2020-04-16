import MarketMakersRepo from './MarketMakersRepo'
import loadContracts from '../contracts'

let marketMakersRepo
let lmsrAddressCache
let providerAccountCache

const resetMarketMakersRepo = () => {
  marketMakersRepo = undefined
}

export const loadMarketMakersRepo = async (web3, lmsrAddress, account) => {
  try {
    if (
      (account && account !== providerAccountCache) ||
      (lmsrAddress && lmsrAddress !== lmsrAddressCache)
    ) {
      resetMarketMakersRepo()
    }
    if (!marketMakersRepo) {
      lmsrAddressCache = lmsrAddress
      providerAccountCache = account

      const contracts = await loadContracts(web3, lmsrAddress, account)
      marketMakersRepo = new MarketMakersRepo(contracts)
    }
    return marketMakersRepo
  } catch (err) {
    console.error(err)
    return null
  }
}

//export default loadMarketMakersRepo
