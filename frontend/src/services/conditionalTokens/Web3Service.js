import ConditionalTokens from '../../contracts/build/ConditionalTokens.json'
import LMSRMarketMaker from '../../contracts/build/LMSRMarketMaker.json'
import WETH9 from '../../contracts/build/WETH9.json'
import { default as Web3 } from 'web3';


const TruffleContract = require('@truffle/contract')

let contracts;
let lmsrAddressCache;
let providerAccountCache;

export const getAccount = async () => {
    console.log('Started acoutn');
    
    let account = null;
    try {
      if (
        typeof window.ethereum !== "undefined" ||
        typeof window.web3 !== "undefined"
      ) {
        account = await window.ethereum.enable();
        window.web3 = new Web3(window.ethereum);
        window.readOnly = false;
      } else {
        window.web3 = new Web3(
          new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws")
        );
        window.readOnly = true;
      }
    } catch (error) {
      console.log(error);
    }
    return account;
}

const resetContracts = () => {
  contracts = undefined
  lmsrAddressCache = undefined
  providerAccountCache = undefined
}

export const loadLMSRMarketMakerContract = async (web3) => {
  let lmsrMarketMakerContract
  if (!contracts) {
    lmsrMarketMakerContract = TruffleContract(LMSRMarketMaker)
    lmsrMarketMakerContract.setProvider(web3.currentProvider)
  }
  return lmsrMarketMakerContract
}

export const loadConditionalTokensContract = async (web3) => {
  let conditionalTokensContract
  if (!contracts) {
    conditionalTokensContract = TruffleContract(ConditionalTokens)
    conditionalTokensContract.setProvider(web3.currentProvider)
  }
  return conditionalTokensContract
}

export const loadWETH9Contract = async (web3) => {
  let weth9Contract
  if (!contracts) {
    weth9Contract = TruffleContract(WETH9)
    weth9Contract.setProvider(web3.currentProvider)
  }
  return weth9Contract
}

const loadContracts = async (web3, lmsrAddress, account) => {
  try {
    if (
      (account && account !== providerAccountCache) ||
      (lmsrAddress && lmsrAddress !== lmsrAddressCache)
    ) {
      resetContracts()
    }
    if (!contracts) {
      providerAccountCache = account
      lmsrAddressCache = lmsrAddress

      const LMSRMarketMakerContract = await loadLMSRMarketMakerContract(web3)
      const ConditionalTokensContract = await loadConditionalTokensContract(web3)
      const WETH9Contract = await loadWETH9Contract(web3)

      const lmsrMarketMaker = await LMSRMarketMakerContract.at(lmsrAddress)
      const conditionalTokens = await ConditionalTokensContract.at(await lmsrMarketMaker.pmSystem())
      const collateralToken = {
        address: await lmsrMarketMaker.collateralToken(),
        contract: await WETH9Contract.at(await lmsrMarketMaker.collateralToken()),
        name: 'Wrapped Ether',
        decimals: 18,
        symbol: 'WETH',
      }

      contracts = { lmsrMarketMaker, conditionalTokens, collateralToken }
    }
    return contracts
  } catch (err) {
    console.error(err)
    return null
  }
}

export default loadContracts
