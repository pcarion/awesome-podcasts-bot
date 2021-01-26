import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import appFunction from './index';
import mkServerlessHandler from './lambda';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const handler = mkServerlessHandler(appFunction);
  return handler(event, context);
};
