// Imports
import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLBoolean } from 'graphql';
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
        weakfootabilitytypecode: { type: GraphQLInt }
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
        getPlayerVersionsByQuality: {
            type: new GraphQLList(CardType),
            description: "Fetch players by quality.",
            args: { qualtiy: { type: GraphQLString } },
            async resolve(parent, { qualtiy }) {
                try {
                    let rating;
                    if (qualtiy.includes("gold")) rating = [75, 100];
                    if (qualtiy.includes("silver")) rating = [65, 74];
                    if (qualtiy.includes("gold")) rating = [0, 64];

                    let res = await pool.query(`SELECT * FROM players WHERE rating >= ${rating[0]} AND rating <= ${rating[1]} AND rareflag = ${qualtiy.split("-")[0]}`);
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
            description: "Fetch list of players by name. This has a limit of 40 players.",
            args: { name: { type: GraphQLString } },
            async resolve(parent, { name }) {
                try {
                    return await pool.query(`SELECT * FROM players_meta WHERE CONCAT_WS(' ',first_name,last_name) LIKE ${escape(`%${name}%`)} OR common_name LIKE ${escape(`%${name}%`)} LIMIT 40`);
                } catch (e) {
                    return null;
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

export default new GraphQLSchema({
    query: RootQuery
});
