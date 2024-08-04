import { parseUserId } from "../../auth/utils.mjs";
import { updateTodo } from "../../businessLogic/todos.js";
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
            const todoId = event.pathParameters.todoId
            const updatedTodo = JSON.parse(event.body)
            const userId = parseUserId(event.headers.Authorization)

            await updateTodo(todoId, userId, updatedTodo)
            
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            }
        }
    )
