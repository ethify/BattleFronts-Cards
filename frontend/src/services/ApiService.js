import { getAccount } from "../services/conditionalTokens/Web3Service";
import {
  startGame,
  playCard,
  userGame,
  nextRound,
  endGame,
  setUsername,
} from "./GameLogic";

class ApiService {
  static getCurrentUser() {
    return new Promise((resolve, reject) => {
      resolve(localStorage.getItem("cardgame_account"));
    });
  }

  static login({ username }) {
    return new Promise((resolve, reject) => {
      setUsername(username);
      localStorage.setItem("cardgame_account", username);
      resolve();
    });
  }

  static startGame() {
    return new Promise((resolve, reject) => {
      startGame();
      resolve();
    });
  }

  static playCard(cardIdx) {
    return new Promise((resolve, reject) => {
      playCard(cardIdx);
      resolve();
    });
  }

  static nextRound() {
    return new Promise((resolve, reject) => {
      nextRound();
      resolve();
    });
  }

  static async endGame() {
    const accounts = await getAccount();
    return new Promise(async (resolve, reject) => {
      endGame(accounts[0]);
      resolve();
    });
  }

  static async getUserByName(username) {
    return userGame;
  }
}

export default ApiService;
