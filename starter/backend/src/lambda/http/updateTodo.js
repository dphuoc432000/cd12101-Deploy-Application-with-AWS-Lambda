import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
            const updatedTodo = JSON.parse(event.body)
            const userId = parseUserId(event.headers.Authorization);

            // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
            const command = new UpdateCommand({
                TableName: TODOS_TABLE,
                UpdateExpression: "set #name = :name, dueDate = :dueDate, done =:done",
                Key: {
                    "todoId": todoId,
                    "userId": userId
                }, 
                ExpressionAttributeNames: {
                    "#name": "name",
                },
                ExpressionAttributeValues: {
                    ":name": updatedTodo.name,
                    ":dueDate": updatedTodo.dueDate,
                    ":done": updatedTodo.done
                },
                ReturnValues: "ALL_NEW",
            })

            const response = await docClient.send(command);
            
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            }
        }
    )
