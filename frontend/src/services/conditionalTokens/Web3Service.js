import ConditionalTokens from "../../contracts/build/ConditionalTokens.json";
import LMSRMarketMaker from "../../contracts/build/LMSRMarketMaker.json";
import WETH9 from "../../contracts/build/WETH9.json";
import { default as Web3 } from "web3";

import * as EthereumTx from "ethereumjs-tx";

import { getConditionId, getPositionId } from "./utils/markets";

import BigNumber from "bignumber.js";

import { loadConditionalTokensRepo } from "./logic/ConditionalTokens";
import { loadMarketMakersRepo } from "./logic/MarketMakers";

const markets = require("./config.local.json");

const selfPrivate =
  "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
const selfAddress = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
const selfAddressOracle = "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0";
const selfOraclePrivate =
  "6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1";

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

  console.log("conditionalTokensRepo", conditionalTokensRepo);

  marketMakersRepo = await loadMarketMakersRepo(
    window.web3,
    markets.lmsrAddress,
    account
  );

  console.log("marketMakersRepo", marketMakersRepo);
};

export const buyToken = async (account, amount) => {
  await initialiseMarkets(account);
  await buyConditionalToken(0, account, amount);
  await buySelfToken(1, selfAddress, amount);
};

export const buyConditionalToken = async (
  pSelectedOutcome,
  account,
  amount
) => {
  await getMarketInfo(account);

  const collateral = await marketMakersRepo.getCollateralToken();

  const formattedAmount = new BigNumber(amount).multipliedBy(
    new BigNumber(Math.pow(10, collateral.decimals))
  );

  const outcomeTokenAmounts = Array.from(
    { length: marketInfo.outcomes.length },
    (value, index) =>
      index === pSelectedOutcome ? formattedAmount : new BigNumber(0)
  );

  const cost = await marketMakersRepo.calcNetCost(outcomeTokenAmounts);

  const collateralBalance = await collateral.contract.balanceOf(account);

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

  const tx = await marketMakersRepo.trade(outcomeTokenAmounts, cost, account);
};

export const buySelfToken = async (pSelectedOutcome, selfAddress, amount) => {
  const account = window.web3.utils.toChecksumAddress(selfAddress);
  const privateKey = new Buffer.from(selfPrivate, "hex");

  const collateral = await marketMakersRepo.getCollateralToken();

  console.log(collateral);

  const formattedAmount = new BigNumber(amount).multipliedBy(
    new BigNumber(Math.pow(10, collateral.decimals))
  );

  console.log(formattedAmount.toFixed());

  const outcomeTokenAmounts = Array.from(
    { length: marketInfo.outcomes.length },
    (value, index) =>
      index === pSelectedOutcome ? formattedAmount : new BigNumber(0)
  );

  const strOutcomeTokenAmounts = outcomeTokenAmounts.map((value) => {
    return value.toString()
  })

  console.log('strOutcomeTokenAmounts', strOutcomeTokenAmounts)

  console.log('outcomeTkenAMounts', outcomeTokenAmounts)

  const cost = await marketMakersRepo.calcNetCost(outcomeTokenAmounts);
  console.log("cost", cost.toString());

  const collateralBalance = await collateral.contract.balanceOf(account);
  console.log("colBalance", collateralBalance.toString());

  //if (cost.gt(collateralBalance)) {
    // const depositData = collateral.contract.contract.methods
    //   .deposit()
    //   .encodeABI();

    // const transactionObj = {
    //   to: collateral.address,
    //   data: depositData,
    //   gas: 2000000,
    //   from: window.web3.utils.toChecksumAddress(selfAddress),
    //   nonce: await window.web3.eth.getTransactionCount(
    //     window.web3.utils.toChecksumAddress(selfAddress)
    //   ),
    //   value: formattedAmount,
    // };

    // console.log("transactionObj", transactionObj);
    // var tx = new EthereumTx.Transaction(transactionObj);
    // tx.sign(privateKey);
    // var stx = tx.serialize();
    // window.web3.eth.sendSignedTransaction(
    //   "0x" + stx.toString("hex"),
    //   async (err, hash) => {
    //     if (err) {
    //       console.log("dposit", err);
    //     }
    //     console.log("depoiste hash" + hash);



        const approveData = collateral.contract.contract.methods
          .approve(marketInfo.lmsrAddress, formattedAmount.toString())
          .encodeABI();

        const transactionObjApprove = {
          to: collateral.address,
          data: approveData,
          gas: 2000000,
          from: window.web3.utils.toChecksumAddress(selfAddress),
          nonce: await window.web3.eth.getTransactionCount(
            window.web3.utils.toChecksumAddress(selfAddress)
          ),
        };
        var tx = new EthereumTx.Transaction(transactionObjApprove);
        tx.sign(privateKey);
        var stx = tx.serialize();
        window.web3.eth.sendSignedTransaction(
          "0x" + stx.toString("hex"),
          async (err, hash) => {
            if (err) {
              console.log("approve eroo", err);
            }
            console.log("approve hash" + hash);
            const selfBuyData = marketMakersRepo.lmsrMarketMaker.contract.methods
              .trade(strOutcomeTokenAmounts, cost.toString())
              .encodeABI();

            console.log("selfBuyData", selfBuyData);

            const transactionObj = {
              to: marketMakersRepo.lmsrMarketMaker.address,
              data: selfBuyData,
              gas: 2000000,
              from: account,
              nonce: await window.web3.eth.getTransactionCount(
                account
              ),
            };
            var tx = new EthereumTx.Transaction(transactionObj);
            tx.sign(privateKey);
            var stx = tx.serialize();
            window.web3.eth.sendSignedTransaction(
              "0x" + stx.toString("hex"),
              async (err, hash) => {
                if (err) {
                  console.log("buy error", err);
                }
                console.log("buy hash" + hash);
              }
            );
          }
        );
      //}
    //);
  //}

  //const tx = await marketMakersRepo.trade(outcomeTokenAmounts, cost, account);
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

    marketInfo = marketData;
    resolve();
  });
};

export const redeem = async (account) => {
  console.log("This is redeem");
  const collateral = await marketMakersRepo.getCollateralToken();

  const indexSets = Array.from({ length: marketInfo.outcomes.length }, (v, i) =>
    i === 0 ? 1 : parseInt(Math.pow(10, i).toString(), 2)
  );

  const tx = await conditionalTokensRepo.redeemPositions(
    collateral.address,
    `0x${"0".repeat(64)}`,
    marketInfo.conditionId,
    indexSets,
    account
  );
};

export const redeemSelf = async () => {
  console.log("This is redeem");
  const collateral = await marketMakersRepo.getCollateralToken();

  const indexSets = Array.from({ length: marketInfo.outcomes.length }, (v, i) =>
    i === 0 ? 1 : parseInt(Math.pow(10, i).toString(), 2)
  );

  // const tx = await conditionalTokensRepo.redeemPositions(
  //   collateral.address,
  //   `0x${"0".repeat(64)}`,
  //   marketInfo.conditionId,
  //   indexSets,
  //   account
  // );

  const privateKey = new Buffer.from(selfPrivate, "hex");
  console.log("This is close");
  const redeemSelfData = conditionalTokensRepo.conditionalTokens.contract.methods
    .redeemPositions(
      collateral.address,
      `0x${"0".repeat(64)}`,
      marketInfo.conditionId,
      indexSets
    )
    .encodeABI();

  console.log("redeemSelfData", redeemSelfData);

  const transactionObj = {
    to: conditionalTokensRepo.conditionalTokens.address,
    data: redeemSelfData,
    gas: 2000000,
    from: window.web3.utils.toChecksumAddress(selfAddress),
    nonce: await window.web3.eth.getTransactionCount(
      window.web3.utils.toChecksumAddress(selfAddress)
    ),
  };
  var tx = new EthereumTx.Transaction(transactionObj);
  tx.sign(privateKey);
  var stx = tx.serialize();
  window.web3.eth.sendSignedTransaction(
    "0x" + stx.toString("hex"),
    (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("close hash" + hash);
    }
  );
};

const close = async () => {
  const privateKey = new Buffer.from(selfPrivate, "hex");
  console.log("This is close");
  const closeData = await marketMakersRepo.lmsrMarketMaker.contract.methods
    .close()
    .encodeABI();

  console.log("closeData", closeData);

  const transactionObj = {
    to: marketMakersRepo.lmsrMarketMaker.address,
    data: closeData,
    gas: 2000000,
    from: window.web3.utils.toChecksumAddress(selfAddress),
    nonce: await window.web3.eth.getTransactionCount(
      window.web3.utils.toChecksumAddress(selfAddress)
    ),
  };
  var tx = new EthereumTx.Transaction(transactionObj);
  tx.sign(privateKey);
  var stx = tx.serialize();
  window.web3.eth.sendSignedTransaction(
    "0x" + stx.toString("hex"),
    (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("close hash" + hash);
    }
  );
};

const resolveGame = async (resolutionOutcomeIndex) => {
  const privateKey = new Buffer.from(selfOraclePrivate, "hex");
  console.log("This is resolve");
  const payouts = Array.from(
    { length: marketInfo.outcomes.length },
    (value, index) => (index === resolutionOutcomeIndex ? 1 : 0)
  );

  const resolveData = conditionalTokensRepo.conditionalTokens.contract.methods
    .reportPayouts(marketInfo.questionId, payouts)
    .encodeABI();

  console.log("resolveData", resolveData);

  const transactionObj = {
    to: conditionalTokensRepo.conditionalTokens.address,
    data: resolveData,
    gas: 2000000,
    from: window.web3.utils.toChecksumAddress(selfAddressOracle),
    nonce: await window.web3.eth.getTransactionCount(
      window.web3.utils.toChecksumAddress(selfAddressOracle)
    ),
  };
  var tx = new EthereumTx.Transaction(transactionObj);
  tx.sign(privateKey);
  var stx = tx.serialize();
  window.web3.eth.sendSignedTransaction(
    "0x" + stx.toString("hex"),
    (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("resolve hash" + hash);
    }
  );
};

export const endGameStakes = async (resolutionOutcomeIndex, account) => {
  await resolveGame(resolutionOutcomeIndex);
  await close();
  await redeem(account);
  await redeemSelf();
};

const TruffleContract = require("@truffle/contract");

let contracts;
let lmsrAddressCache;
let providerAccountCache;

export const getAccount = async () => {
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
  } catch (error) {}
  return account;
};

const resetContracts = () => {
  contracts = undefined;
  lmsrAddressCache = undefined;
  providerAccountCache = undefined;
};

export const loadLMSRMarketMakerContract = async (web3) => {
  let lmsrMarketMakerContract;
  if (!contracts) {
    lmsrMarketMakerContract = TruffleContract(LMSRMarketMaker);
    lmsrMarketMakerContract.setProvider(web3.currentProvider);
  }
  return lmsrMarketMakerContract;
};

export const loadConditionalTokensContract = async (web3) => {
  let conditionalTokensContract;
  if (!contracts) {
    conditionalTokensContract = TruffleContract(ConditionalTokens);
    conditionalTokensContract.setProvider(web3.currentProvider);
  }
  return conditionalTokensContract;
};

export const loadWETH9Contract = async (web3) => {
  let weth9Contract;
  if (!contracts) {
    weth9Contract = TruffleContract(WETH9);
    weth9Contract.setProvider(web3.currentProvider);
  }
  return weth9Contract;
};

const loadContracts = async (web3, lmsrAddress, account) => {
  try {
    if (
      (account && account !== providerAccountCache) ||
      (lmsrAddress && lmsrAddress !== lmsrAddressCache)
    ) {
      resetContracts();
    }
    if (!contracts) {
      providerAccountCache = account;
      lmsrAddressCache = lmsrAddress;

      const LMSRMarketMakerContract = await loadLMSRMarketMakerContract(web3);
      const ConditionalTokensContract = await loadConditionalTokensContract(
        web3
      );
      const WETH9Contract = await loadWETH9Contract(web3);

      const lmsrMarketMaker = await LMSRMarketMakerContract.at(lmsrAddress);
      const conditionalTokens = await ConditionalTokensContract.at(
        await lmsrMarketMaker.pmSystem()
      );
      const collateralToken = {
        address: await lmsrMarketMaker.collateralToken(),
        contract: await WETH9Contract.at(
          await lmsrMarketMaker.collateralToken()
        ),
        name: "Wrapped Ether",
        decimals: 18,
        symbol: "WETH",
      };

      contracts = { lmsrMarketMaker, conditionalTokens, collateralToken };
    }
    return contracts;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export default loadContracts;
