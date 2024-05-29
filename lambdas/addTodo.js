import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  const todoId = randomUUID(); 
  console.log("Received event (", todoId, "): ", event);
  const requestBody = JSON.parse(event.body);
  const { title } = requestBody;

  try {
    await addTodo(todoId, title, false);

    return {
      statusCode: 201,
      body: JSON.stringify({
        ID: todoId,
        Title: title,
        CreatedAt: new Date().toISOString(),
        IsComplete: false,
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error(err);
    return errorResponse(err.message, event.requestContext.requestId);
  }
};

const addTodo = async (todoId, title, isComplete) => {
  const params = {
    TableName: "toDoApp",
    Item: {
      ID: { S: todoId },
      Title: { S: title },
      CreatedAt: { S: new Date().toISOString() },
      IsComplete: { BOOL: isComplete },
    },
  };
  const command = new PutItemCommand(params);
  await ddbClient.send(command);
};

const errorResponse = (errorMessage, awsRequestId) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
