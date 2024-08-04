import {
    parseUserId
} from "../../auth/utils.mjs";
import { v4 as uuidv4 } from 'uuid'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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
            const newTodo = JSON.parse(event.body);
            const todoId = uuidv4();
            const userId = parseUserId(event.headers.Authorization);
            const createdAt = new Date().toISOString();

            // create todo
            newTodo.todoId = todoId;
            newTodo.userId = userId;
            newTodo.createdAt = createdAt;
            newTodo.attachmentUrl = "";
            newTodo.done = false;

            const command = new PutCommand({
                TableName: TODOS_TABLE,
                Item: newTodo,
            });

            const response = await docClient.send(command);
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: newTodo
                })
            };
        }
    )

