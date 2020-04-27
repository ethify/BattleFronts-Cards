import ConditionalTokens from '../../contracts/build/ConditionalTokens.json'
import LMSRMarketMaker from '../../contracts/build/LMSRMarketMaker.json'
import WETH9 from '../../contracts/build/WETH9.json'
import { default as Web3 } from 'web3';

import {
  getConditionId,
  getPositionId,
} from "./utils/markets";

import BigNumber from "bignumber.js";

import { loadConditionalTokensRepo } from "./logic/ConditionalTokens";
import { loadMarketMakersRepo } from "./logic/MarketMakers";

const markets = require("./config.local.json");

const MarketStage = {
  Running: 0,
  Paused: 1,
  Closed: 2,
};

let conditionalTokensRepo;
let marketMakersRepo;
let marketInfo;

export const initialiseMarkets = async (account) => {
  conditionalTokensRepo = await loadConditionalTokensRepo(
    window.web3,
    markets.lmsrAddress,
    account
  );

  marketMakersRepo = await loadMarketMakersRepo(
    window.web3,
    markets.lmsrAddress,
    account
  );
}

export const buyToken = async (account, amount) => {
  await initialiseMarkets(account)
  console.log("Entered player 1");
  await buyConditionalToken(0, account, amount);
};

export const buyConditionalToken = async (pSelectedOutcome, account, amount) => {
  await getMarketInfo(account);

  console.log("marketinfo", marketInfo);

  const collateral = await marketMakersRepo.getCollateralToken();
  console.log("coolastrer", collateral);

  const formattedAmount = new BigNumber(amount).multipliedBy(
    new BigNumber(Math.pow(10, collateral.decimals))
  );

  const outcomeTokenAmounts = Array.from(
    { length: marketInfo.outcomes.length },
    (value, index) =>
      index === pSelectedOutcome ? formattedAmount : new BigNumber(0)
  );

  const cost = await marketMakersRepo.calcNetCost(
    outcomeTokenAmounts
  );

  console.log("cost", cost);

  const collateralBalance = await collateral.contract.balanceOf(
    account
  );

  console.log("collateralbal", collateralBalance);
  console.log("graterornot", cost.gt(collateralBalance));

  if (cost.gt(collateralBalance)) {
    await collateral.contract.deposit({
      value: formattedAmount.toString(),
      from: account,
    });
    await collateral.contract.approve(
      marketInfo.lmsrAddress,
      formattedAmount.toString(),
      {
        from: account,
      }
    );
  }

  const tx = await marketMakersRepo.trade(
    outcomeTokenAmounts,
    cost,
    account
  );
  console.log("trade transaction", { tx });
};

export const getMarketInfo = async (account) => {
  return new Promise(async (resolve, reject) => {
    //if (!process.env.REACT_APP_ORACLE_ADDRESS) return
    const collateral = await marketMakersRepo.getCollateralToken();
    const conditionId = getConditionId(
      process.env.REACT_APP_ORACLE_ADDRESS,
      markets.markets[0].questionId,
      markets.markets[0].outcomes.length
    );
    const payoutDenominator = await conditionalTokensRepo.payoutDenominator(
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
      const collectionId = await conditionalTokensRepo.getCollectionId(
        `0x${"0".repeat(64)}`,
        conditionId,
        indexSet
      );
      const positionId = getPositionId(collateral.address, collectionId);
      const probability = await marketMakersRepo.calcMarginalPrice(
        outcomeIndex
      );
      const balance = await conditionalTokensRepo.balanceOf(
        account,
        positionId
      );
      const payoutNumerator = await conditionalTokensRepo.payoutNumerators(
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
      stage: MarketStage[await marketMakersRepo.stage()],
      questionId: markets.markets[0].questionId,
      conditionId: conditionId,
      payoutDenominator: payoutDenominator,
    };

    marketInfo = marketData
    resolve();
  });
};

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
