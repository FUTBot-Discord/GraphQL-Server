// Load enviorment variables
import dotenv from 'dotenv';
dotenv.config();

// Imports
import express from 'express';
import graphqlHTTP from 'express-graphql';

// Import GraphQLSchema
import schema from './schema';

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(process.env.SERVER_PORT, () => {
    console.log(`GraphQL server is now listing on ${process.env.SERVER_PORT}`);
});