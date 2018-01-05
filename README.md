# Ghost Backup to S3 Lambda

Compatible with Ghost ^1.18.2

![Build Status](https://codebuild.us-east-1.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiMEg4OTY0T29pVGVqMTRnKzAyOEc0Uk9UZnB2Y2k3UkpJZUQ4S044Z3lsREtsNzRGWVo5SnBoaUprYkpxQjVYanpjRUU1MSt5Q0s0bEFGRDMyWmFLRnYwPSIsIml2UGFyYW1ldGVyU3BlYyI6ImJHVGlIWEE1T2pOZnRuT1MiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

This function is designed to run as an AWS Lambda. Trigger periodically to backup ghost blog site to s3. Calls the ghost site private api remotely to get a data snapshot and then writes that JSON response to a file in the specified s3 location.

## Environment Variables
| Name  | Description  |
|---|---|
|  GHOST_URL | Ghost blog Url to be backed up. Eg. https://blog.dionhut.net |
|  CLIENT_ID | Client Id.  See [here](https://api.ghost.org/docs/user-authentication) how to manually obtain client_id and client_secret. |
|  SECRET | Client Secret  |
|  USERNAME | Ghost admin username  |
|  PASSWORD | Ghost admin password  |
|  S3_BUCKET | S3 bucket where backup file will be written  |
|  S3_KEY | S3 path where backup file will be written  |
| AWS_ACCESS_KEY_ID | (Only required if running outside AWS data center) |
| AWS_SECRET_ACCESS_KEY | (Only required if running outside AWS data center) | 

