import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { parseUserId } from "../../auth/utils.mjs";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const s3Client = new S3Client()

const TODOS_TABLE = process.env.TODOS_TABLE;
const bucketName = process.env.TODOS_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

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

            const todo = {
                todoId,
                userId,
                attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${userId}/${todoId}`,
            }

            const signedUrl = await getUploadUrl(todo);
            
            await updateAttachmentUrl(todo);

            // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
            return {
                statusCode: 200,
                body: JSON.stringify({
                    uploadUrl: signedUrl
                })
            }
        }
    )
  
const getUploadUrl = async (todo) => {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${todo.userId}/${todo.todoId}`
    })
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: urlExpiration
    })
    return url;
}

const updateAttachmentUrl = async (todo) => {
    const command = new UpdateCommand({
        TableName: TODOS_TABLE,
        UpdateExpression: "set attachmentUrl = :attachmentUrl",
        Key: {
            "todoId": todo.todoId,
            "userId": todo.userId
        },
        ExpressionAttributeValues: {
            ":attachmentUrl": todo.attachmentUrl
        },
        ReturnValues: "ALL_NEW",
    })

    await docClient.send(command);

    return todo;
}
