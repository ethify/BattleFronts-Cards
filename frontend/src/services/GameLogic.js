import { game_status, card_dict, card, game } from "../config";
import * as _ from "lodash";

import { endGameStakes } from "../services/conditionalTokens/Web3Service";

const EMPTY = 0;
const FIRE = 1;
const WOOD = 2;
const WATER = 3;
const NEUTRAL = 4;
const VOID = 5;

export var initailUserGame = {
  username: localStorage.getItem("cardgame_account"),
  win_count: 0,
  lost_count: 0,
  game_data: {
    life_player: 5,
    life_ai: 5,
    deck_player: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    deck_ai: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    hand_player: [0, 0, 0, 0],
    hand_ai: [0, 0, 0, 0],
    selected_card_player: 0,
    selected_card_ai: 0,
    life_lost_player: 0,
    life_lost_ai: 0,
    status: game_status.ONGOING,
  },
};

export var userGame = {
  username: localStorage.getItem("cardgame_account"),
  win_count: 0,
  lost_count: 0,
  game_data: {
    life_player: 5,
    life_ai: 5,
    deck_player: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    deck_ai: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    hand_player: [0, 0, 0, 0],
    hand_ai: [0, 0, 0, 0],
    selected_card_player: 0,
    selected_card_ai: 0,
    life_lost_player: 0,
    life_lost_ai: 0,
    status: game_status.ONGOING,
  },
};

export const startGame = () => {
  console.log("check 1", userGame);
  for (var i = 0; i < 4; i++) {
    const newUserCards = drawOneCard(
      userGame.game_data.deck_player,
      userGame.game_data.hand_player
    );
    const newAICards = drawOneCard(
      userGame.game_data.deck_ai,
      userGame.game_data.hand_ai
    );

    userGame.game_data.deck_player = newUserCards.deck;
    userGame.game_data.hand_player = newUserCards.hand;

    userGame.game_data.deck_ai = newAICards.deck;
    userGame.game_data.hand_ai = newAICards.hand;
  }
  console.log("check 2", userGame);
};

export const drawOneCard = (deck, hand) => {
  var deckCardId = Math.floor(Math.random() * deck.length);

  let first_empty_slot = -1;
  for (var i = 0; i <= hand.length; i++) {
    if (hand[i] === 0) {
      first_empty_slot = i;
      break;
    }
  }

  if (first_empty_slot === -1) {
    return "No empty slot";
  }

  hand[first_empty_slot] = deck[deckCardId];
  deck.splice(deckCardId, 1);

  return { hand, deck };
};

export const playCard = (playerCardId) => {
  if (userGame.game_data.status !== game_status.ONGOING) {
    return "Game Ended";
  }

  if (userGame.game_data.selected_card_player !== 0) {
    return "Player has Card this turn";
  }

  userGame.game_data.selected_card_player =
    userGame.game_data.hand_player[playerCardId];
  userGame.game_data.hand_player[playerCardId] = 0;

  const aiCardID = Math.floor(
    Math.random() * userGame.game_data.hand_ai.length
  );
  userGame.game_data.selected_card_ai = userGame.game_data.hand_ai[aiCardID];
  userGame.game_data.hand_ai[aiCardID] = 0;

  resolveSelectedCards();
  updateGameStatus();
};

export const resolveSelectedCards = () => {
  const playerCard = card_dict[userGame.game_data.selected_card_player];
  const aiCard = card_dict[userGame.game_data.selected_card_ai];

  console.log(playerCard, aiCard);

  if (playCard[0] === VOID || aiCard[0] === VOID) {
    return;
  }

  var playerAttackPoint = calculateAttackPoint(playerCard, aiCard);
  var aiAttackPoint = calculateAttackPoint(aiCard, playerCard);

  if (playerAttackPoint > aiAttackPoint) {
    var diff = playerAttackPoint - aiAttackPoint;
    userGame.game_data.life_lost_ai = diff;
    userGame.game_data.life_ai -= diff;
  } else if (aiAttackPoint > playerAttackPoint) {
    var diff = aiAttackPoint - playerAttackPoint;
    userGame.game_data.life_lost_player = diff;
    userGame.game_data.life_player -= diff;
  }
};

export const calculateAttackPoint = (card1, card2) => {
  var result = card1[1];

  if (
    (card1[0] === FIRE && card2[0] === WOOD) ||
    (card1[0] === WOOD && card2[0] === WATER) ||
    (card1[0] === WATER && card2[0] === FIRE)
  ) {
    result++;
  }

  return result;
};

export const updateGameStatus = () => {
  if (userGame.game_data.life_ai <= 0) {
    userGame.game_data.status = game_status.PLAYER_WON;
  } else if (userGame.game_data.life_player <= 0) {
    userGame.game_data.status = game_status.PLAYER_LOST;
  } else {
    const playerFinished =
      userGame.game_data.hand_player.filter((card) => card === 0).length === 4;
    const aiFinished =
      userGame.game_data.hand_ai.filter((card) => card === 0).length === 4;

    if (playerFinished || aiFinished) {
      if (userGame.game_data.life_player > userGame.game_data.life_ai) {
        userGame.game_data.status = game_status.PLAYER_WON;
      } else {
        userGame.game_data.status = game_status.PLAYER_LOST;
      }
    }
  }

  if (userGame.game_data.status == game_status.PLAYER_WON) {
    userGame.win_count++;
  } else if (userGame.game_data.status == game_status.PLAYER_LOST) {
    userGame.lost_count++;
  }
};

export const nextRound = () => {
  if (userGame.game_data.status !== game_status.ONGOING) {
    return "This game has ended";
  }
  if (
    userGame.game_data.selected_card_player === 0 ||
    userGame.game_data.selected_card_ai === 0
  ) {
    return "Play a card first";
  }

  userGame.game_data.selected_card_player = 0;
  userGame.game_data.selected_card_ai = 0;
  userGame.game_data.life_lost_player = 0;
  userGame.game_data.life_lost_ai = 0;

  if (userGame.game_data.deck_player.length > 0) {
    const newUserCards = drawOneCard(
      userGame.game_data.deck_player,
      userGame.game_data.hand_player
    );

    userGame.game_data.deck_player = newUserCards.deck;
    userGame.game_data.hand_player = newUserCards.hand;
  }
  if (userGame.game_data.deck_ai.length > 0) {
    const newAICards = drawOneCard(
      userGame.game_data.deck_ai,
      userGame.game_data.hand_ai
    );

    userGame.game_data.deck_ai = newAICards.deck;
    userGame.game_data.hand_ai = newAICards.hand;
  }
};

export const endGame = async (account) => {
  if (userGame.life_player > userGame.life_ai) {
    await endGameStakes(0, account);
  } else {
    await endGameStakes(1, account);
  }
  userGame.game_data = _.cloneDeep(initailUserGame.game_data);
};

export const setUsername = (username) => {
  userGame.username = username;
};
