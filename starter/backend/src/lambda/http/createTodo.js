import {
    parseUserId
} from "../../auth/utils.mjs";
import { createTodo } from "../../businessLogic/todos.js";
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

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
            const userId = parseUserId(event.headers.Authorization);

            const todo = await createTodo(userId, newTodo);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    item: todo
                })
            };
        }
    )

