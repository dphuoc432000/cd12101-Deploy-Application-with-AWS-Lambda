import { getAllTodosForUser } from '../../businessLogic/todos.js';
import { parseUserId } from '../../auth/utils.mjs';
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
            // TODO: Get all TODO items for a current user
            const userId = parseUserId(event.headers.Authorization);
            
            const items = await getAllTodosForUser(userId);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    items
                }),
            }
        }
    )

