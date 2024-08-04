import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { parseUserId } from "../../auth/utils.mjs";
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TODOS_TABLE = process.env.TODOS_TABLE;

export const handler = middy()
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
    .handler( 
        async (event) => {
            const todoId = event.pathParameters.todoId
            const userId = parseUserId(event.headers.Authorization)

            // TODO: Remove a TODO item by id
            const command = new DeleteCommand({
                TableName: TODOS_TABLE,
                Key: {
                    "todoId": todoId,
                    "userId": userId
                }
            })

            const response = await docClient.send(command);

            return {
                statusCode: 200,
                body: JSON.stringify({})
            }
        }
    )

