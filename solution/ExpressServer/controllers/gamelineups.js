const Model = require('../models/gamelineups');

/**
 * Get player number by player ID
 * @param  playerId - ID of the player
 * @returns {Promise} Promise object represents the player number
 */
function getPlayerNumberByIdPlayer(playerId) {
    return Model.findOne({ player_id: playerId },{_id:0,number:1})
}

/**
 * Get all match players, divided in starting lineup and substitutes
 * @param game_id
 * @param home_club_id
 * @param away_club_id
 * @returns {Promise<T>}
 */
function getMatchPlayers(game_id,home_club_id, away_club_id){
    return Model.aggregate([
        {
            $match:{
                game_id:game_id,
                $or:[
                    {club_id:home_club_id},
                    {club_id:away_club_id}
                ]
            }
        },
        {
            $group:{
                _id:{
                    game_id:"$game_id",
                    club_id:"$club_id",
                    type:"$type"
                },
                players:{
                    $push:{
                        player_id:"$player_id",
                        player_name:"$player_name",
                        position:"$position",
                        team_captain:"$team_captain",
                        number:"$number"
                    }
                }
            }
        },
        {
            $group:{
                _id:{
                    game_id:"$_id.game_id",
                    club_id:"$_id.club_id"
                },
                lineup:{
                    $push:{
                        type:"$_id.type",
                        players:"$players"
                    }
                }
            }
        },

        {
            $project:{
                _id:0,
                game_id:"$_id.game_id",
                club_id:"$_id.club_id",
                lineup:{
                    $arrayToObject:{
                        $map:{
                            input:"$lineup",
                            as:"ln",
                            in:{
                                k:"$$ln.type",
                                v:"$$ln.players"
                            }
                        }
                    }
                }
            }
        },
        {
            $facet:{
                home_lineup:[
                    {
                        $match:{
                            club_id:home_club_id
                        }
                    }
                ],
                away_lineup:[
                    {
                        $match:{
                            club_id:away_club_id
                        }
                    }
                ]
            }
        }
    ])
}

module.exports = {
    getPlayerNumberByIdPlayer,
    getMatchPlayers
};