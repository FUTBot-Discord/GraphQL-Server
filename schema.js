// Imports
import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLBoolean } from 'graphql';
import { escape } from 'mysql';
import pool from './mysql';

const CardType = new GraphQLObjectType({
    name: 'Card',
    fields: () => ({
        asset_id: { type: GraphQLID },
        att_workrate: { type: GraphQLInt },
        cardsubtypeid: { type: GraphQLInt },
        def: { type: GraphQLInt },
        def_workrate: { type: GraphQLInt },
        dri: { type: GraphQLInt },
        id: { type: GraphQLID },
        league_id: { type: GraphQLID },
        league_info: {
            type: LeagueType,
            async resolve(parent) {
                try {
                    let res = await pool.query(`SELECT * FROM leagues WHERE id = ${parent.league_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        nation_id: { type: GraphQLID },
        nation_info: {
            type: NationType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM nations WHERE id = ${parent.nation_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        pac: { type: GraphQLInt },
        pas: { type: GraphQLInt },
        phy: { type: GraphQLInt },
        meta_info: {
            type: PlayerType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM players_meta WHERE id = ${parent.asset_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        preferred_position: { type: GraphQLString },
        preferred_foot: { type: GraphQLInt },
        rareflag: { type: GraphQLInt },
        rating: { type: GraphQLInt },
        resource_id: { type: GraphQLInt },
        sho: { type: GraphQLInt },
        skillmoves: { type: GraphQLInt },
        other_versions: {
            type: new GraphQLList(CardType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM players WHERE asset_id = ${parent.asset_id}`);
                } catch (e) {
                    return null;
                }
            }
        },
        club_id: { type: GraphQLID },
        club_info: {
            type: ClubType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM clubs WHERE id = ${parent.club_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        weakfootabilitytypecode: { type: GraphQLInt },
        totw: { type: GraphQLBoolean },
        min_price: { type: GraphQLInt }
    })
});

const PlayerType = new GraphQLObjectType({
    name: 'Player',
    fields: () => ({
        card_versions: {
            type: new GraphQLList(CardType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM players WHERE asset_id = ${parent.id} ORDER BY rating DESC`);
                } catch (e) {
                    return null;
                }
            }
        },
        id: { type: GraphQLID },
        common_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        first_name: { type: GraphQLString },
        img: { type: GraphQLString },
        birthday: { type: GraphQLInt },
        height: { type: GraphQLInt }
    })
});

const FUTBotType = new GraphQLObjectType({
    name: 'FUTBot',
    fields: () => ({
        id: { type: GraphQLInt },
        common_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        first_name: { type: GraphQLString },
        rareflag: { type: GraphQLInt },
        rating: { type: GraphQLInt }
    })
});

const ClubType = new GraphQLObjectType({
    name: 'Club',
    fields: () => ({
        abbr_name: { type: GraphQLString },
        name: { type: GraphQLString },
        id: { type: GraphQLInt },
        r: { type: GraphQLInt },
        g: { type: GraphQLInt },
        b: { type: GraphQLInt },
        img: { type: GraphQLString },
        league_id: { type: GraphQLID },
        league_info: {
            type: LeagueType,
            async resolve(parent) {
                try {
                    let res = await pool.query(`SELECT * FROM leagues WHERE id = ${parent.league_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        name: { type: GraphQLString },
        card_list: {
            type: new GraphQLList(CardType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM players WHERE club_id = ${parent.id}`);
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const NationType = new GraphQLObjectType({
    name: 'Nation',
    fields: () => ({
        name: { type: GraphQLString },
        id: { type: GraphQLID },
        img: { type: GraphQLString },
        league_list: {
            type: new GraphQLList(LeagueType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM leagues WHERE nation_id = ${parent.id}`);
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const LeagueType = new GraphQLObjectType({
    name: 'League',
    fields: () => ({
        abbr_name: { type: GraphQLString },
        clubsList: {
            type: new GraphQLList(ClubType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM clubs WHERE league_id = ${parent.id}`);
                } catch (e) {
                    return null;
                }
            }
        },
        id: { type: GraphQLID },
        img: { type: GraphQLString },
        nation_id: { type: GraphQLID },
        nation_info: {
            type: NationType,
            async resolve(parent) {
                try {
                    let res = await pool.query(`SELECT * FROM nations WHERE id = ${parent.nation_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const CommandType = new GraphQLObjectType({
    name: 'Command',
    fields: () => ({
        command: { type: GraphQLString },
        guild_id: { type: GraphQLString },
        id: { type: GraphQLInt }
    })
});

const FlippingPlayerType = new GraphQLObjectType({
    name: 'FlippingPlayer',
    fields: () => ({
        player_id: { type: GraphQLInt },
        guild_id: { type: GraphQLString },
        console: { type: GraphQLString },
        id: { type: GraphQLInt },
        buy_price: { type: GraphQLInt },
        sell_price: { type: GraphQLInt },
        sold_price: { type: GraphQLInt },
        player_info: {
            type: CardType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM players WHERE id = ${parent.player_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const CommandPubType = new GraphQLObjectType({
    name: 'CommandPub',
    fields: () => ({
        command: { type: GraphQLString },
        id: { type: GraphQLInt }
    })
});

const CardColorType = new GraphQLObjectType({
    name: 'CardColor',
    fields: () => ({
        color_stripes: { type: GraphQLString },
        color_attr_values: { type: GraphQLString },
        color_attr_names: { type: GraphQLString },
        color_text: { type: GraphQLString },
        id: { type: GraphQLInt },
        font_1: { type: GraphQLString },
        font_2: { type: GraphQLString },
        font_3: { type: GraphQLString },
        rarity: { type: GraphQLString }
    })
});

const PackType = new GraphQLObjectType({
    name: 'Pack',
    fields: () => ({
        name: { type: GraphQLString },
        name_id: { type: GraphQLString },
        id: { type: GraphQLInt },
        description: { type: GraphQLString },
        price: { type: GraphQLInt },
        points: { type: GraphQLInt },
        players: { type: GraphQLInt }
    })
});

const UserClubType = new GraphQLObjectType({
    name: 'UserClub',
    fields: () => ({
        id: { type: GraphQLInt },
        author_id: { type: GraphQLString },
        creation_time: { type: GraphQLInt },
        coins: { type: GraphQLInt },
        points: { type: GraphQLInt },
        player_list: {
            type: new GraphQLList(ClubPlayerType),
            async resolve(parent, args) {
                try {
                    return await pool.query(`SELECT * FROM club_players WHERE club_id = ${parent.id}`);
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const AuctionPlayerType = new GraphQLObjectType({
    name: 'AuctionPlayer',
    fields: () => ({
        id: { type: GraphQLInt },
        player_id: { type: GraphQLInt },
        b_club_id: { type: GraphQLString },
        s_club_id: { type: GraphQLString },
        current_bid: { type: GraphQLInt },
        buy_now: { type: GraphQLInt },
        end_timestamp: { type: GraphQLString },
        card_info: {
            type: CardType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM players WHERE id = ${parent.player_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        b_club_info: {
            type: UserClubType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM user_clubs WHERE id = ${parent.b_club_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        s_club_info: {
            type: UserClubType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM user_clubs WHERE id = ${parent.s_club_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const TransferpileType = new GraphQLObjectType({
    name: 'Transferpile',
    fields: () => ({
        id: { type: GraphQLInt },
        player_id: { type: GraphQLInt },
        club_id: { type: GraphQLString },
        auction_id: {
            type: GraphQLInt
        },
        card_info: {
            type: CardType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM players WHERE id = ${parent.player_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        club_info: {
            type: UserClubType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM user_clubs WHERE id = ${parent.b_club_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        auction_info: {
            type: AuctionPlayerType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM auctions WHERE id = ${parent.auction_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const AuctionCountType = new GraphQLObjectType({
    name: 'AuctionCount',
    fields: () => ({
        auctions: { type: GraphQLInt }
    })
});

const ClubPlayerType = new GraphQLObjectType({
    name: 'ClubPlayer',
    fields: () => ({
        id: { type: GraphQLInt },
        club_id: { type: GraphQLString },
        player_id: { type: GraphQLString },
        card_info: {
            type: CardType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM players WHERE id = ${parent.player_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        club_info: {
            type: UserClubType,
            async resolve(parent, args) {
                try {
                    let res = await pool.query(`SELECT * FROM user_clubs WHERE id = ${parent.club_id}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        }
    })
});

const CommandLogType = new GraphQLObjectType({
    name: 'CommandLog',
    fields: () => ({
        command: { type: GraphQLString },
        guildName: { type: GraphQLString },
        channelName: { type: GraphQLString },
        userName: { type: GraphQLString },
        guildId: { type: GraphQLInt },
        channelId: { type: GraphQLInt },
        userId: { type: GraphQLInt },
        id: { type: GraphQLInt },
        timestamp: { type: GraphQLString }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Here you can find all the available queries.',
    fields: {
        getPlayerVersionById: {
            type: CardType,
            description: "Fetch player by id.",
            args: { id: { type: GraphQLID } },
            async resolve(parent, { id }) {
                try {
                    let res = await pool.query(`SELECT * FROM players WHERE id = ${escape(id)}`);
                    return res[0];
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        },
        getCardColorsByRarity: {
            type: CardColorType,
            description: "Fetch card colors by rarity.",
            args: { rarity: { type: GraphQLString } },
            async resolve(parent, { rarity }) {
                try {
                    let res = await pool.query(`SELECT * FROM card_colors WHERE rarity = ${escape(rarity)}`);
                    return res[0];
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        },
        getPacks: {
            type: new GraphQLList(PackType),
            description: "Fetch packs.",
            args: { name: { type: GraphQLString } },
            async resolve(parent, { name }) {
                if (!name || name == undefined) {
                    try {
                        let res = await pool.query(`SELECT * FROM packs`);
                        return res;
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                } else {
                    try {
                        let res = await pool.query(`SELECT * FROM packs WHERE name LIKE ${escape(`%${name}%`)}`);
                        return res;
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                }
            }
        },
        getPackById: {
            type: PackType,
            description: "Fetch pack by id.",
            args: { id: { type: GraphQLID } },
            async resolve(parent, { id }) {
                try {
                    let res = await pool.query(`SELECT * FROM packs WHERE id = ${escape(id)}`);
                    return res[0];
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        },
        getPlayerVersionPackEmulator: {
            type: CardType,
            description: "Fetch player for pack emulator.",
            args: {
                ratingB: {
                    type: GraphQLInt
                },
                ratingT: {
                    type: GraphQLInt
                },
                rareflag: {
                    type: GraphQLID
                }
            },
            async resolve(parent, { ratingB, ratingT, rareflag }) {
                if (!rareflag || rareflag == undefined) {
                    try {
                        let res = await pool.query(`SELECT * FROM players WHERE rating >= ${escape(ratingB)} AND rating <= ${escape(ratingT)} ORDER BY RAND() LIMIT 1`);
                        return res[0];
                    } catch (e) {
                        console.log(e);
                        return null;
                    }
                } else {
                    let rareflags = rareflag.split(",");
                    let rArray = [];

                    for (let r of rareflags) {
                        rArray.push(`rareflag = ${escape(r)}`);
                    }

                    if (rareflags.includes("3")) {
                        try {
                            let res = await pool.query(`SELECT * FROM players WHERE rating >= ${escape(ratingB)} AND rating <= ${escape(ratingT)} AND (${rArray.join(" OR ")}) AND totw = true ORDER BY RAND() LIMIT 1`);
                            return res[0];
                        } catch (e) {
                            console.log(e);
                            return null;
                        }
                    } else {
                        try {
                            let res = await pool.query(`SELECT * FROM players WHERE rating >= ${escape(ratingB)} AND rating <= ${escape(ratingT)} AND (${rArray.join(" OR ")}) ORDER BY RAND() LIMIT 1`);
                            return res[0];
                        } catch (e) {
                            console.log(e);
                            return null;
                        }
                    }
                }

            }
        },
        getPlayerVersionsByQuality: {
            type: new GraphQLList(CardType),
            description: "Fetch players by quality.",
            args: { qualtiy: { type: GraphQLString } },
            async resolve(parent, { qualtiy }) {
                try {
                    let rating;
                    if (qualtiy.includes("gold")) rating = [75, 100];
                    if (qualtiy.includes("silver")) rating = [65, 74];
                    if (qualtiy.includes("bronze")) rating = [0, 64];

                    let res = await pool.query(`SELECT * FROM players WHERE rating >= ${rating[0]} AND rating <= ${rating[1]} AND rareflag = ${escape(qualtiy.split("-")[0])} ORDER BY RAND() LIMIT 1`);
                    return res;
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        },
        getPlayerVersionsByAssetId: {
            type: new GraphQLList(CardType),
            description: "Fetch list of players by asset_id.",
            args: { asset_id: { type: GraphQLID } },
            async resolve(parent, { asset_id }) {
                try {
                    return await pool.query(`SELECT * FROM players WHERE asset_id = ${escape(asset_id)}`);
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        },
        getPlayersByName: {
            type: new GraphQLList(PlayerType),
            description: "Fetch list of players by name. This has a limit of 20 players.",
            args: { name: { type: GraphQLString } },
            async resolve(parent, { name }) {
                try {
                    return await pool.query(`SELECT DISTINCT pm.common_name, pm.first_name, pm.id, pm.last_name, pm.img, pm.birthday, pm.height FROM players p INNER JOIN players_meta pm ON p.asset_id = pm.id WHERE CONCAT_WS(' ',pm.first_name,pm.last_name) LIKE ${escape(`%${name}%`)} OR pm.common_name LIKE ${escape(`%${name}%`)} LIMIT 20`);
                } catch (e) {
                    return null;
                }
            }
        },
        FUTBotGetPlayersByName: {
            type: new GraphQLList(FUTBotType),
            description: "Fetch list of players by name. This has a limit of 20 players.",
            args: { name: { type: GraphQLString }, rating: { type: GraphQLInt } },
            async resolve(parent, { name, rating }) {
                if (rating && rating !== undefined && isFinite(rating)) {
                    try {
                        return await pool.query(`SELECT pm.common_name, pm.first_name, p.id, pm.last_name, p.rating, p.rareflag FROM players p INNER JOIN players_meta pm ON p.asset_id = pm.id WHERE (CONCAT_WS(' ',pm.first_name,pm.last_name) LIKE ${escape(`%${name}%`)} OR pm.common_name LIKE ${escape(`%${name}%`)}) AND p.rating = ${escape(rating)} ORDER BY p.rating DESC LIMIT 20`);
                    } catch (e) {
                        return null;
                    }
                } else {
                    try {
                        return await pool.query(`SELECT pm.common_name, pm.first_name, p.id, pm.last_name, p.rating, p.rareflag FROM players p INNER JOIN players_meta pm ON p.asset_id = pm.id WHERE CONCAT_WS(' ',pm.first_name,pm.last_name) LIKE ${escape(`%${name}%`)} OR pm.common_name LIKE ${escape(`%${name}%`)} ORDER BY p.rating DESC LIMIT 20`);
                    } catch (e) {
                        return null;
                    }
                }

            }
        },
        getCommandsPublic: {
            type: new GraphQLList(CommandPubType),
            description: "Fetch list of public commands.",
            async resolve(parent) {
                try {
                    return await pool.query(`SELECT * from commands_public`);
                } catch (e) {
                    return null;
                }
            }
        },
        getCommandWhitelist: {
            type: new GraphQLList(CommandType),
            description: "Fetch list of commands allowed by guildId.",
            args: { guild_id: { type: new GraphQLNonNull(GraphQLString) }, command: { type: GraphQLString } },
            async resolve(parent, { guild_id, command }) {
                if (command == undefined && !command) {
                    try {
                        return await pool.query(`SELECT * from whitelist_commands WHERE guild_id = ${escape(guild_id)}`);
                    } catch (e) {
                        return null;
                    }
                } else {
                    try {
                        return await pool.query(`SELECT * from whitelist_commands WHERE guild_id = ${escape(guild_id)} AND command = ${escape(command)}`);
                    } catch (e) {
                        return null;
                    }
                }

            }
        },
        getFlippingList: {
            type: new GraphQLList(FlippingPlayerType),
            description: "Fetch flipping list from guildId and console.",
            args: { guild_id: { type: new GraphQLNonNull(GraphQLString) }, console: { type: new GraphQLNonNull(GraphQLString) } },
            async resolve(parent, { guild_id, console }) {
                try {
                    return await pool.query(`SELECT * from flipping_list WHERE guild_id = ${escape(guild_id)} AND console = ${escape(console)}`);
                } catch (e) {
                    return null;
                }
            }
        },
        getFlippingListItem: {
            type: FlippingPlayerType,
            description: "Fetch flipping list item guildId, console and playerId.",
            args: {
                guild_id: { type: new GraphQLNonNull(GraphQLString) },
                console: { type: new GraphQLNonNull(GraphQLString) },
                player_id: { type: new GraphQLNonNull(GraphQLInt) }
            },
            async resolve(parent, { guild_id, console, player_id }) {
                try {
                    let res = await pool.query(`SELECT * from flipping_list WHERE guild_id = ${escape(guild_id)} AND console = ${escape(console)} AND player_id = ${escape(player_id)}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        getUserClubByAuthorId: {
            type: UserClubType,
            description: "Fetch club info by authorid",
            args: {
                author_id: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, { author_id }) {
                try {
                    let res = await pool.query(`SELECT * from user_clubs WHERE author_id = ${escape(author_id)}`);
                    return res[0];
                } catch (e) {
                    return null;
                }
            }
        },
        getActiveTOTWPlayers: {
            type: new GraphQLList(CardType),
            description: "Fetch all active TOTW players.",
            async resolve(parent) {
                try {
                    return await pool.query(`SELECT * from players WHERE totw = true ORDER BY rating DESC`);
                } catch (e) {
                    return null;
                }
            }
        },
        getClubPlayer: {
            type: ClubPlayerType,
            description: "Fetch club player by id, playerid or clubid",
            args: {
                club_id: { type: GraphQLString },
                player_id: { type: GraphQLString },
                id: { type: GraphQLInt },
            },
            async resolve(parent, { club_id, player_id, id }) {
                if (!id || id == undefined) {
                    try {
                        let res = await pool.query(`SELECT * from club_players WHERE club_id = ${escape(club_id)} AND player_id = ${escape(player_id)}`);
                        return res[0];
                    } catch (e) {
                        return null;
                    }
                } else {
                    try {
                        let res = await pool.query(`SELECT * from club_players WHERE id = ${escape(id)}`);
                        return res[0];
                    } catch (e) {
                        return null;
                    }
                }
            }
        },
        getClubCollection: {
            type: new GraphQLList(ClubPlayerType),
            description: "Fetch all club players.",
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLString },
                page: { type: GraphQLInt }
            },
            async resolve(parent, { club_id, name, page }) {
                if (!name || name == undefined) {
                    if (!page || page == undefined) {
                        try {
                            return await pool.query(`SELECT c.* from club_players c JOIN players p ON p.id = c.player_id WHERE c.club_id = ${escape(club_id)} ORDER BY p.rating DESC`);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        let limit;

                        if (page == 1 || page == 0) {
                            limit = `LIMIT 18`;
                        } else if (page > 1) {
                            let n = (page - 1) * 18;
                            limit = `LIMIT ${n},18`;
                        } else {
                            return null;
                        }

                        try {
                            return await pool.query(`SELECT c.* from club_players c JOIN players p ON p.id = c.player_id WHERE c.club_id = ${escape(club_id)} ORDER BY p.rating DESC ${limit}`);
                        } catch (e) {
                            return null;
                        }
                    }
                } else {
                    if (!page || page == undefined) {
                        try {
                            return await pool.query(`SELECT c.* from club_players c JOIN players p ON p.id = c.player_id JOIN futbot.players_meta m ON m.id = p.asset_id WHERE c.club_id = ${escape(club_id)} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)}) ORDER BY p.rating DESC`);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        let limit;

                        if (page == 1 || page == 0) {
                            limit = `LIMIT 18`;
                        } else if (page > 1) {
                            let n = (page - 1) * 18;
                            limit = `LIMIT ${n},18`;
                        } else {
                            return null;
                        }

                        try {
                            return await pool.query(`SELECT c.* from club_players c JOIN players p ON p.id = c.player_id JOIN futbot.players_meta m ON m.id = p.asset_id WHERE c.club_id = ${escape(club_id)} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)}) ORDER BY p.rating DESC ${limit}`);
                        } catch (e) {
                            return null;
                        }
                    }
                }
            }
        },
        getTransferpile: {
            type: new GraphQLList(TransferpileType),
            description: "Fetch all from transferpile.",
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                page: { type: GraphQLInt },
                name: {
                    type: GraphQLString
                }
            },
            async resolve(parent, { club_id, name, page }) {
                if (!name || name == undefined) {
                    if (!page || page == undefined) {
                        try {
                            return await pool.query(`select t.* from club_transfers t JOIN players p ON p.id = t.player_id where t.club_id = ${escape(club_id)} ORDER BY t.auction_id IS NOT NULL, p.rating DESC`);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        let limit;

                        if (page == 1 || page == 0) {
                            limit = `LIMIT 12`;
                        } else if (page > 1) {
                            let n = (page - 1) * 12;
                            limit = `LIMIT ${n},12`;
                        } else {
                            return null;
                        }

                        try {
                            return await pool.query(`select t.* from club_transfers t JOIN players p ON p.id = t.player_id where t.club_id = ${escape(club_id)} ORDER BY t.auction_id IS NOT NULL, p.rating DESC ${limit}`);
                        } catch (e) {
                            return null;
                        }
                    }
                } else {
                    if (!page || page == undefined) {
                        try {
                            return await pool.query(`select t.* from club_transfers t JOIN players p ON p.id = t.player_id where t.club_id = ${escape(club_id)} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)}) ORDER BY t.auction_id IS NOT NULL, p.rating DESC`);
                        } catch (e) {
                            return null;
                        }
                    } else {
                        let limit;

                        if (page == 1 || page == 0) {
                            limit = `LIMIT 12`;
                        } else if (page > 1) {
                            let n = (page - 1) * 12;
                            limit = `LIMIT ${n},12`;
                        } else {
                            return null;
                        }

                        try {
                            return await pool.query(`select t.* from club_transfers t JOIN players p ON p.id = t.player_id where t.club_id = ${escape(club_id)} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)}) ORDER BY t.auction_id IS NOT NULL, p.rating DESC ${limit}`);
                        } catch (e) {
                            return null;
                        }
                    }
                }
            }
        },
        getTransferpilePlayer: {
            type: TransferpileType,
            description: "Fetch player from transferpile.",
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, { club_id, id }) {
                try {
                    let res = await pool.query(`SELECT * FROM club_transfers WHERE club_id = ${escape(club_id)} AND id = ${escape(id)}`);
                    return res[0];
                } catch (e) {
                    return null;
                }

            }
        },
        getClubCollectionPlayer: {
            type: ClubPlayerType,
            description: "Fetch player from club by id.",
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, { club_id, id }) {
                try {
                    let res = await pool.query(`SELECT * FROM club_players WHERE club_id = ${escape(club_id)} AND id = ${escape(id)}`);
                    return res[0];
                } catch (e) {
                    return null;
                }

            }
        },
        getCurrentAuctions: {
            type: new GraphQLList(AuctionPlayerType),
            description: "Fetch page of actions.",
            args: {
                name: { type: GraphQLString },
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                page: { type: new GraphQLNonNull(GraphQLInt) }
            },
            async resolve(parent, { club_id, name, page }) {
                let limit;

                if (page == 1 || page == 0) {
                    limit = `LIMIT 16`;
                } else if (page > 1) {
                    let n = (page - 1) * 16;
                    limit = `LIMIT ${n},16`;
                } else {
                    return null;
                }

                let cDate = new Date();
                cDate = cDate.getTime();

                if (!name || name == undefined) {
                    try {
                        return await pool.query(`SELECT * FROM auctions WHERE s_club_id <> ${escape(club_id)} AND end_timestamp > ${cDate} ORDER BY end_timestamp DESC ${limit}`);
                    } catch (e) {
                        return null;
                    }
                } else {
                    try {
                        return await pool.query(`SELECT * FROM auctions WHERE s_club_id <> ${escape(club_id)} AND end_timestamp > ${cDate} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)}) ORDER BY end_timestamp DESC ${limit}`);
                    } catch (e) {
                        return null;
                    }
                }
            }
        },
        getCurrentAuctionsCount: {
            type: AuctionCountType,
            description: "Fetch amount of auctions.",
            args: {
                name: { type: GraphQLString },
                club_id: { type: new GraphQLNonNull(GraphQLString) }
            },
            async resolve(parent, { club_id, name, page }) {
                let cDate = new Date();
                cDate = cDate.getTime();

                if (!name || name == undefined) {
                    try {
                        let res = await pool.query(`SELECT COUNT(id) as auctions FROM auctions WHERE s_club_id <> ${escape(club_id)} AND end_timestamp > ${cDate}`);
                        return res[0];
                    } catch (e) {
                        return null;
                    }
                } else {
                    try {
                        let res = await pool.query(`SELECT COUNT(id) as auctions FROM auctions WHERE s_club_id <> ${escape(club_id)} AND end_timestamp > ${cDate} AND (CONCAT_WS(' ',m.first_name,m.last_name) LIKE ${escape(`%${name}%`)} OR m.common_name LIKE ${escape(`%${name}%`)})`);
                        return res[0];
                    } catch (e) {
                        return null;
                    }
                }
            }
        }
        // getPlayers: {
        //     type: new GraphQLList(PlayerType),
        //     description: "Fetch list of players by there lastname. This has a limit of 40 players.",
        //     args: { name: { type: GraphQLString } },
        //     async resolve(parent, { name }) {
        //         try {
        //             return await pool.run(r.table("players").filter((player) => {
        //                 return player('name').match(`(?i)${name}`)
        //                     .or(player('commonName').match(`(?i)${name}`));
        //             }).orderBy(r.desc('rating')).limit(40));
        //         } catch (e) {
        //             return null;
        //         }
        //     }
        // },
        // getClubs: {
        //     type: new GraphQLList(ClubType),
        //     description: "Fetch list of clubs by there name, this has a limit of 40 clubs.",
        //     args: { name: { type: GraphQLString } },
        //     async resolve(parent, { name }) {
        //         try {
        //             return await pool.run(r.table("clubs").filter((club) => {
        //                 return club('name').match(`(?i)${name}`);
        //             }).orderBy(r.asc('name')).limit(40));
        //         } catch (e) {
        //             return null;
        //         }
        //     }
        // },
        // getClub: {
        //     type: ClubType,
        //     description: "Fetch club information by ID.",
        //     args: { id: { type: GraphQLInt } },
        //     async resolve(parent, { id }) {
        //         try {
        //             return await pool.run(r.table("clubs").get(id));
        //         } catch (e) {
        //             console.log(e);
        //             return null;
        //         }
        //     }
        // }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Here you can find all the available mutations.',
    fields: {
        addCommandWhitelist: {
            type: CommandType,
            args: {
                command: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, { command, guildId }) {
                try {
                    pool.query(`INSERT INTO whitelist_commands (command, guild_id) VALUES (${escape(command)}, ${escape(guildId)})`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        removeCommandWhitelist: {
            type: CommandType,
            args: {
                command: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, { command, guildId }) {
                try {
                    pool.query(`DELETE FROM whitelist_commands WHERE command = ${escape(command)} AND guild_id = ${escape(guildId)}`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        addCommandLog: {
            type: CommandLogType,
            args: {
                command: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) },
                channelId: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: new GraphQLNonNull(GraphQLString) },
                guildName: { type: new GraphQLNonNull(GraphQLString) },
                channelName: { type: new GraphQLNonNull(GraphQLString) },
                userName: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, { command, guildId, channelId, userId, guildName, channelName, userName }) {
                try {
                    pool.query(`INSERT INTO command_log (guild_name, guild_id, user_name, user_id, channel_name, channel_id, command) VALUES (${escape(guildName.rIE())}, ${guildId}, ${escape(userName.rIE())}, ${userId}, ${escape(channelName.rIE())}, ${channelId}, ${escape(command.rIE())})`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        removeItemFlippingList: {
            type: FlippingPlayerType,
            args: {
                pConsole: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) },
                player_id: { type: GraphQLInt }
            },
            resolve(parent, { pConsole, guildId, player_id }) {
                if (!player_id || player_id == undefined) {
                    try {
                        pool.query(`DELETE FROM flipping_list WHERE guild_id = ${escape(guildId)} AND console = ${escape(pConsole)}`);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    try {
                        pool.query(`DELETE FROM flipping_list WHERE guild_id = ${escape(guildId)} AND console = ${escape(pConsole)} AND player_id = ${escape(player_id)}`);
                    } catch (e) {
                        console.log(e);
                    }
                }

            }
        },
        addItemFlippingList: {
            type: FlippingPlayerType,
            args: {
                pConsole: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) },
                player_id: { type: new GraphQLNonNull(GraphQLInt) },
                buy_price: { type: new GraphQLNonNull(GraphQLInt) },
                sell_price: { type: new GraphQLNonNull(GraphQLInt) },
                sold_price: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, { pConsole, guildId, player_id, buy_price, sell_price, sold_price }) {
                try {
                    pool.query(`INSERT INTO flipping_list (console, guild_id, player_id, buy_price, sell_price, sold_price) VALUES (${escape(pConsole)}, ${escape(guildId)}, ${escape(player_id)}, ${escape(buy_price)}, ${escape(sell_price)}, ${escape(sold_price)})`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        updateItemFlippingList: {
            type: FlippingPlayerType,
            args: {
                pConsole: { type: new GraphQLNonNull(GraphQLString) },
                guildId: { type: new GraphQLNonNull(GraphQLString) },
                player_id: { type: new GraphQLNonNull(GraphQLInt) },
                buy_price: { type: new GraphQLNonNull(GraphQLInt) },
                sell_price: { type: new GraphQLNonNull(GraphQLInt) },
                sold_price: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve(parent, { pConsole, guildId, player_id, buy_price, sell_price, sold_price }) {
                try {
                    pool.query(`UPDATE flipping_list buy_price = ${escape(buy_price)}, sell_price = ${escape(sell_price)}, sold_price = ${escape(sold_price)} WHERE guild_id = ${escape(guildId)} AND console = ${escape(pConsole)} AND player_id = ${escape(player_id)}`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        addClubPlayer: {
            type: ClubPlayerType,
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                player_id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, { club_id, player_id }) {
                try {
                    pool.query(`INSERT INTO club_players (club_id, player_id) VALUES (${escape(club_id)}, ${escape(player_id)})`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        addTransferPlayer: {
            type: TransferpileType,
            args: {
                club_id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                player_id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                auction_id: {
                    type: GraphQLInt
                },
            },
            resolve(parent, {
                club_id,
                player_id,
                auction_id
            }) {
                if (!auction_id || auction_id == undefined) {
                    try {
                        pool.query(`INSERT INTO club_transfers (club_id, player_id) VALUES (${escape(club_id)}, ${escape(player_id)})`);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    try {
                        pool.query(`INSERT INTO club_transfers (club_id, player_id, auction_id) VALUES (${escape(club_id)}, ${escape(player_id)}, ${escape(auction_id)})`);
                    } catch (e) {
                        console.log(e);
                    }
                }
                
            }
        },
        createUserClub: {
            type: UserClubType,
            args: {
                author_id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parent, { author_id }) {
                try {
                    pool.query(`INSERT INTO user_clubs (author_id) VALUES (${escape(author_id)})`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        addCoinsToClub: {
            type: UserClubType,
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                coins: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, { club_id, coins }) {
                try {
                    pool.query(`UPDATE user_clubs SET coins = coins + ${escape(coins)} WHERE id = ${escape(club_id)}`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        removeCoinsFromClub: {
            type: UserClubType,
            args: {
                club_id: { type: new GraphQLNonNull(GraphQLString) },
                coins: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, { club_id, coins }) {
                try {
                    pool.query(`UPDATE user_clubs SET coins = coins - ${escape(coins)} WHERE id = ${escape(club_id)}`);
                } catch (e) {
                    console.log(e);
                }
            }
        },
        removePlayerFromTransferpile: {
            type: TransferpileType,
            args: {
                club_id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            async resolve(parent, {
                club_id,
                id
            }) {
                try {
                    await pool.query(`DELETE FROM club_transfers WHERE id = ${escape(id)} AND club_id = ${escape(club_id)}`);
                    return true;
                } catch (e) {
                    console.log(e);
                    return false;
                }
            }
        },
        removePlayerFromClub: {
            type: ClubPlayerType,
            args: {
                club_id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            async resolve(parent, {
                club_id,
                id
            }) {
                try {
                    await pool.query(`DELETE FROM club_players WHERE id = ${escape(id)} AND club_id = ${escape(club_id)}`);
                    return true;
                } catch (e) {
                    console.log(e);
                    return false;
                }
            }
        }
    }
});

export default new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

String.prototype.rIE = function (char) {
    return this.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, '');
};