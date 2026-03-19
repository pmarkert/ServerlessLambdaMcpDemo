# Serverless Lambda MCP Demo

This project demonstrates running a serverless Lambda function to host an MCP server via the Stateless HTTP Streamable protocol. The Lambda function is designed to handle multiple concurrent processes (MCP) efficiently.

This project uses:

- AWS CDK for deployment.
- AWS Lambda to host the MCP server.
- Hono for the web-server and @hono/mcp for the MCP protocol implementation.
- Zod for schema validation.

## Getting Started

`npm install` to install dependencies.
`npx cdk deploy` to deploy the stack to AWS.

NOTE: If you have never bootstrapped your AWS environment for CDK, you may need to run `cdk bootstrap` first.

After deployment the CDK will display the MCP Server's URL. You can use this URL to connect your MCP clients.
To make changes, edit the code in `lib/serverless-lambda-mcp-demo-stack.ts` and then run `cdk deploy` again to update the stack.

## Cleaning up

When finished, use `cdk destroy` to clean up the resources.
