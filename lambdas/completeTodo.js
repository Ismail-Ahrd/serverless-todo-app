import {
    DynamoDBClient,
    UpdateItemCommand,
    GetItemCommand,
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient();
  
export const handler = async (event) => {
    const toDoId = event.pathParameters.toDoId;
    console.log("Received event for toDoId: ", toDoId);
    const requestBody = JSON.parse(event.body);
    const { IsComplete } = requestBody;

    try {
        const currentItem = await getTodoById(toDoId);
        if (!currentItem) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Todo item not found",
                }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
            };
        }

        await updateTodoIsComplete(toDoId, IsComplete);

        return {
            statusCode: 200,
            body: JSON.stringify({
                ID: toDoId,
                IsComplete: IsComplete,
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
  
const getTodoById = async (toDoId) => {
    const params = {
        TableName: "toDoApp",
        Key: {
            ID: { S: toDoId },
        },
    };
    try {
        const command = new GetItemCommand(params);
        const data = await ddbClient.send(command);

        return data.Item || null;
    } catch (error) {
        console.error("Error fetching todo:", error);
        throw error;
    }
};
  
const updateTodoIsComplete = async (toDoId, isComplete) => {
    const params = {
        TableName: "toDoApp",
        Key: {
            ID: { S: toDoId },
        },
        UpdateExpression: "SET IsComplete = :IsComplete",
        ExpressionAttributeValues: {
            ":IsComplete": { BOOL: isComplete },
        },
        ReturnValues: "UPDATED_NEW",
    };
    const command = new UpdateItemCommand(params);
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
  