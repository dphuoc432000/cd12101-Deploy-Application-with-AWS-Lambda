import { createLogger } from '../utils/logger.mjs'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    QueryCommand,
    DeleteCommand,
    PutCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";

const logger = createLogger("todoAccess");

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX

export class TodosAccess {
    constructor(
        client = new DynamoDBClient({}),
        todosTable = TODOS_TABLE,
        todosCreatedAtIndex = TODOS_CREATED_AT_INDEX
    ) {
        this.client = client;
        this.todosTable = todosTable;
        this.todosCreatedAtIndex = todosCreatedAtIndex;
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    async getAllTodosForUser(userId) {
        logger.info({
            "action": `Getting all todos for user ${userId}`
        });

        const command = new QueryCommand({
            TableName: this.todosTable,
            IndexName: this.todosCreatedAtIndex,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            },
            ConsistentRead: true,
        });

        const response = await this.docClient.send(command);

        return response.Items;
    }

    async createTodo(newTodo) {
        logger.info({
            "action": "Creating todo"
        });

        const command = new PutCommand({
            TableName: this.todosTable,
            Item: newTodo,
        });

        await this.docClient.send(command);
    }

    async updateTodo(todoId, userId, updatedTodo) {
        logger.info({
            "action": `Updating todo ${todoId}`
        });

        const command = new UpdateCommand({
            TableName: this.todosTable,
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

        await this.docClient.send(command);
    }

    async updateAttachmentUrlTodo(todoId, userId, attachmentUrl) {
        logger.info({
            "action": `Updating attachment url todo ${todoId}`
        });

        const command = new UpdateCommand({
            TableName: this.todosTable,
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl
            },
            ReturnValues: "ALL_NEW",
        })

        await this.docClient.send(command);
    }

    async deleteTodo(todoId, userId) {
        logger.info({
            "action": `Deleting todo ${todoId}`
        });

        const command = new DeleteCommand({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        })

        await this.docClient.send(command);
    }
}