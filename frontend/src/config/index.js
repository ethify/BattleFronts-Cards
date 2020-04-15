export const game_status =  {
    ONGOING     :0,
    PLAYER_WON   :1,
    PLAYER_LOST  :-1
  };

export const game = {
    life_player: 5,
    life_ai: 5,
    deck_player: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],   
    deck_ai: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 
    hand_player: [1,5,7,0],   
    hand_ai: [6,3,6,3],   
    selected_card_player: 0,             
    selected_card_ai: 0,   
    life_lost_player: 0,
    life_lost_ai: 0,
    status: game_status.ONGOING,
}

const EMPTY = 0;
const FIRE = 1;
const WOOD = 2;
const WATER = 3;
const NEUTRAL = 4;
const VOID = 5;

export const card = {
    type:1,
    attack_point:7,
  };

export const card_dict = [
    [EMPTY, 0],       
    [FIRE, 1],
    [FIRE, 1],
    [FIRE, 2],
    [FIRE, 2],
    [FIRE, 3],
    [WOOD, 1],
    [WOOD, 1],
    [WOOD, 2],
    [WOOD, 2],
    [WOOD, 3], 
    [WATER, 1],
    [WATER, 1],
    [WATER, 2],
    [WATER, 2],
    [WATER, 3],
    [NEUTRAL, 3], 
    [VOID, 0]
];

export const user_info = {
    username: 'username',
    win_count : 0,
    lost_count : 0,
    game_data: game
}

export const seed = {
    key: 1,
    value: 1,
}