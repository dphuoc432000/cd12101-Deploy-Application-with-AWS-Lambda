import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { parseUserId } from "../../auth/utils.mjs";
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
    .handler(
        async (event) => {
            // TODO: Get all TODO items for a current user
            const userId = parseUserId(event.headers.Authorization);
            const command = new QueryCommand({
                TableName: TODOS_TABLE,
                IndexName: TODOS_CREATED_AT_INDEX,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId
                },
                ConsistentRead: true,
            });

            const response = await docClient.send(command);
            const items = response.Items;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    items
                }),
            }
        }
    )

