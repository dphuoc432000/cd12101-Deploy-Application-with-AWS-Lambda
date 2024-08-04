import { v4 as uuidv4 } from 'uuid';
import { TodosAccess } from '../dataLayer/todosAccess.js';
import { S3Access } from '../fileLayer/s3Access.js';

const todosAccess = new TodosAccess();
const s3Access = new S3Access();
const bucketName = process.env.TODOS_BUCKET

export const getAllTodosForUser = async (userId) => {
    return await todosAccess.getAllTodosForUser(userId);
}

export const createTodo = async (userId, newTodo) => {
    newTodo.todoId = uuidv4();
    newTodo.userId = userId;
    newTodo.createdAt = new Date().toISOString();
    newTodo.attachmentUrl = "";
    newTodo.done = false;

    await todosAccess.createTodo(newTodo);

    return newTodo;
}

export const updateTodo = async (todoId, userId, updatedTodo) => {
    await todosAccess.updateTodo(todoId, userId, updatedTodo);
}

export const deleteTodo = async (todoId, userId) => {
    await todosAccess.deleteTodo(todoId, userId);
}

export const updateAttachmentUrlTodo = async (todoId, userId) => {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${userId}/${todoId}`
   
    await todosAccess.updateAttachmentUrlTodo(todoId, userId, attachmentUrl);
}

export const getUploadUrl = async (key) => {
    return await s3Access.getUploadUrl(key);
}