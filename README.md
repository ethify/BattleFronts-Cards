# Name of Project
BattleFront Cards

## Project Description

An exciting game with cards that represent the 5 Elements - Water, Fire, Forest, Dark and Light. 

This uses Gnosis Conditional Tokens to stake on the winning. The winner takes it all and the loser loses all his stake. So be careful while you stake! 

The Game uses beautiful graphics to depicts the fight between the elements. 

### Future Recommendations
- Spectators watching their favourite players live and staking on their victory.
- Long Tournaments where users stake big amounts for longer durations. 
- Shorter matches with few rounds where micro-staking is being done.

## Project Team
    
```
Mitrasish Mukherjee
@rekpero
```
```
Manank Patni
@manankpatni
```

## A prototype (code or no-code)
https://gitlab.com/ethifylabs/battlefront-cards
## Github Repo
https://gitlab.com/ethifylabs/battlefront-cards
## Video Demo
https://youtu.be/bWf4rQn_-5s


## Deployment Instructions - 

1. Clone the Repo

```
https://gitlab.com/ethifylabs/battlefront-cards
```

2. Start the frontend server

```
source .env
cd frontend/
npm start
```

3. Contract Migration and Web3

```
cd frontend/src/contracts
ganache-cli -d
truffle migrate
```

The Game Frontend will be deployed at `localhost:3000`.