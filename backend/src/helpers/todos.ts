import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
//import * as createError from 'http-errors'

//businessLogic
const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  todosAccess.updateTodoItem(todoId, updateTodoRequest as TodoUpdate, userId)
}

export async function deleteTodo(todoId: string, userId: string) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

  todosAccess.deleteTodoItem(todoId, userId)
}

export async function updateAttachmentUrl(userId: string, todoId: string) {
  logger.info(`Generating attachment URL for attachment ${todoId}`)

  const attachmentUrl = await attachmentUtils.getAttachmentUrl(todoId)

  logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Item not found')  // FIXME: 404?

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  // FIXME: 403?
  }

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function createUrl(todoId: string): Promise<string> {
  logger.info(`Generating upload URL for attachment ${todoId}`)

  const uploadUrl = await attachmentUtils.getUploadUrl(todoId)

  return uploadUrl
}
