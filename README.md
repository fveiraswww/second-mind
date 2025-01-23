# Assistant API

Second Mind is your go-to open-source focus buddy, perfect for cutting out distractions while staying in the loop on the important stuff.

Stay in the zone and connected, all on Discord. Think of Second Mind as your digital sidekick for keeping things clear and under control.

Roadmap 🛣️

- [ ]  Hacker news
- [ ]  Relevant emails
- [ ]  Personal cashflow
- [ ]  Relevant Slack messages
- [ ]  Stock

### Hacker news

- **`GET`**  /api/hacker-news
    
    This document describes the functionality, usage, and implementation details of the      `api/hacker-news` endpoint, which fetches top stories from the Hacker News API.
    
    ## Overview
    
    The `api/hacker-news` is an HTTP GET endpoint that retrieves the top stories from Hacker News. It supports an optional query parameter `q` to limit the number of stories returned. The allowed values for `q` are `5`, `15`, or `20`.
    
    ## Request Method
    
    **GET**
    
    ## Query Parameters
    
    - `q` (optional):
        - **Type**: Integer
        - **Description**: Specifies the number of top stories to fetch. Valid values are `5`, `15`, or `20`. Defaults to `5` if not provided.
    
    ## Environment Variables
    
    The function requires the following environment variable:
    
    - `HACKER_NEWS_URL`: The base URL of the Hacker News API (e.g., `https://hacker-news.firebaseio.com/v0`).
    
    ## Response
    
    The function returns a JSON response containing an array of the top stories. Each story object includes the following fields:
    
    - `title`: The title of the story.
    - `url`: The URL of the story.
    - `score`: The score of the story.
    - `by`: The username of the author.
    
    ### Example Response
    
    ```json
    [
      {
        "title": "Example Story 1",
        "url": "https://example.com/story1",
        "score": 120,
        "by": "author1"
      },
      {
        "title": "Example Story 2",
        "url": "https://example.com/story2",
        "score": 95,
        "by": "author2"
      }
    ]
    
    ```
    
    ## Implementation Details
    
    ### Input Validation
    
    The function uses the `zod` library to validate the query parameters. The schema ensures:
    
    - The `q` parameter is an optional string that can be transformed into an integer.
    - The integer value of `q` must be one of `5`, `15`, or `20`.
    
    If the validation fails, the function responds with a `400 Bad Request` status and includes the validation errors in the response.
    
    ### Fetching Stories
    
    1. The function fetches the IDs of the top stories from the Hacker News API endpoint `/topstories.json`.
    2. It retrieves details for the first `q` story IDs by calling the `/item/<id>.json` endpoint for each ID.
    3. It maps the fetched data into an array of simplified story objects containing `title`, `url`, `score`, and `by`.
    
    ### Error Handling
    
    - If the query parameter validation fails, the function returns a `400 Bad Request` response.
    - If the Hacker News API request fails, the function logs the error and returns an empty array in the response.
    
    ## Example Usage
    
    ### Request without Query Parameter
    
    **Request:**
    
    ```
    GET /api/hacker-news HTTP/1.1
    
    ```
    
    **Response:**
    
    ```json
    [
      {
        "title": "Story 1",
        "url": "https://example.com/1",
        "score": 120,
        "by": "author1"
      },
      {
        "title": "Story 2",
        "url": "https://example.com/2",
        "score": 95,
        "by": "author2"
      }
    ]
    
    ```
    
    ### Request with Query Parameter
    
    **Request:**
    
    ```
    GET /api/hacker-news?q=15 HTTP/1.1
    
    ```
    
    **Response:**
    
    ```json
    [
      {
        "title": "Story 1",
        "url": "https://example.com/1",
        "score": 120,
        "by": "author1"
      },
      {
        "title": "Story 2",
        "url": "https://example.com/2",
        "score": 95,
        "by": "author2"
      }
    ]
    
    ```
    
    ### Invalid Query Parameter
    
    **Request:**
    
    ```
    GET /api/hacker-news?q=10 HTTP/1.1
    
    ```
    
    **Response:**
    
    ```json
    {
      "error": [
        {
          "message": "Quantity must be 5, 15, or 20",
          "path": ["q"]
        }
      ]
    }
    
    ```
    
    ## Error Responses
    
    ### 400 Bad Request
    
    Returned when the query parameter validation fails.
    
    **Example:**
    
    ```json
    {
      "error": [
        {
          "message": "Quantity must be 5, 15, or 20",
          "path": ["q"]
        }
      ]
    }
    
    ```
    
    ### 405 Method Not Allowed
    
    Returned when the request method is not `GET`.
    
    **Example:**
    
    ```
    Method not allowed
    
    ```
    
    ---
    
    ## Notes
    
    - Ensure the `HACKER_NEWS_URL` environment variable is correctly set before running the function.
    - The function gracefully handles API errors by returning an empty array in the response.
- `POST`  /api/hacker-news/send-to-discord
    
    This document provides details about the `/api/hacker-news/send-to-discord` endpoint, which retrieves top Hacker News stories and sends them to a specified Discord channel using a webhook URL.
    
    ## Overview
    
    The `postHackerNewsToDiscord` function is an HTTP POST endpoint that accepts parameters to fetch the top Hacker News stories and sends them as a formatted message to a Discord channel via a webhook URL.
    
    ## Request Method
    
    **POST**
    
    ## Request Body
    
    The request body must be a JSON object with the following fields:
    
    - `q` (optional):
        - **Type**: Integer (5, 15, or 20)
        - **Description**: Specifies the number of top stories to fetch from Hacker News. Defaults to `5` if not provided.
    - `webhookUrl` (required):
        - **Type**: String
        - **Description**: The URL of the Discord webhook where the message will be sent.
    
    ### Example Request Body
    
    ```json
    {
      "q": 5,
      "webhookUrl": "https://discord.com/api/webhooks/1234567890/abcdefghij"
    }
    
    ```
    
    ## Response
    
    The function returns a JSON response indicating the status of the operation.
    
    ### Success Response
    
    If the stories are fetched and sent to Discord successfully:
    
    - **Status Code**: 200
    - **Response Body**:
        
        ```json
        {
          "status": "Hacker News stories sent to Discord successfully"
        }
        
        ```
        
    
    ### Error Responses
    
    1. **405 Method Not Allowed**
        - **Condition**: The request method is not `POST`.
        - **Example**:
            
            ```json
            "Method not allowed"
            
            ```
            
    2. **400 Bad Request**
        - **Condition**: The request body is invalid (e.g., missing required fields, invalid types).
        - **Example**:
            
            ```json
            {
              "error": [
                {
                  "message": "webhookUrl is required",
                  "path": ["webhookUrl"]
                },
                {
                  "message": "Quantity must be 5, 15, or 20",
                  "path": ["q"]
                }
              ]
            }
            
            ```
            
    3. **500 Internal Server Error**
        - **Condition**: An error occurred during processing, or the Discord webhook returned an error.
        - **Example**:
            
            ```json
            {
              "error": "Failed to send to Discord: Invalid Webhook Token"
            }
            
            ```
            
    
    ## Implementation Details
    
    ### Input Validation
    
    The function uses the `zod` library to validate the request body:
    
    - Ensures `webhookUrl` is a valid string.
    - Ensures `q` is either 5, 15, or 20 (if provided).
    
    If validation fails, a `400 Bad Request` response is returned with details about the validation errors.
    
    ### Fetching Hacker News Stories
    
    1. The function calls the `/api/hacker-news` endpoint with the specified `q` parameter to fetch the top stories.
    2. If no stories are available, a `500 Internal Server Error` response is returned.
    
    ### Sending the Message to Discord
    
    1. Formats the stories into a clean message with links that do not generate rich previews in Discord.
    2. Sends the message to the specified `webhookUrl`.
    3. If the webhook request fails, an error response is returned with details from Discord.
    
    ### Message Format
    
    The message sent to Discord includes a numbered list of top stories, with titles in bold and links enclosed in `< >` to prevent rich previews.
    
    **Example Message:**
    
    ```
    1. **Story Title 1**
    <https://storylink1.com>
    
    2. **Story Title 2**
    <https://storylink2.com>
    
    3. **Story Title 3**
    <https://storylink3.com>
    
    ```
    
    ## Example Usage
    
    ### Request
    
    ```
    POST /api/hacker-news/send-to-discord HTTP/1.1
    Content-Type: application/json
    
    {
      "q": 10,
      "webhookUrl": "https://discord.com/api/webhooks/1234567890/abcdefghij"
    }
    
    ```
    
    ### Successful Response
    
    ```json
    {
      "status": "Hacker News stories sent to Discord successfully"
    }
    
    ```
    
    ### Error Response (Invalid Body)
    
    ```json
    {
      "error": [
        {
          "message": "Quantity must be 5, 15, or 20",
          "path": ["q"]
        }
      ]
    }
    
    ```
    
    ---
    
    ## Notes
    
    - Ensure the `webhookUrl` is valid and correctly configured in Discord.
    - The stories are fetched from the `/api/hacker-news` endpoint and formatted to avoid rich previews in Discord by wrapping URLs in `< >`.
    - Default behavior fetches the top 5 stories if `q` is not specified.

### Discord

- `POST`  /api/discord/new-message
    
     `/api/discord/new-message` is an HTTP POST endpoint that accepts a JSON payload to send a message to a Discord channel via a webhook URL.
    
    ## Request Method
    
    **POST**
    
    ## Request Body
    
    The request body must be a JSON object with the following fields:
    
    - `webhookUrl` (required):
        - **Type**: String
        - **Description**: The URL of the Discord webhook where the message will be sent.
    - `message` (required):
        - **Type**: String
        - **Description**: The content of the message to send. This cannot be empty.
    
    ### Example Request Body
    
    ```json
    {
      "webhookUrl": "https://discord.com/api/webhooks/1234567890/abcdefghij",
      "message": "Hello, Discord!"
    }
    
    ```
    
    ## Response
    
    The function returns a JSON response indicating the status of the operation.
    
    ### Success Response
    
    If the message is sent successfully:
    
    - **Status Code**: 200
    - **Response Body**:
        
        ```json
        {
          "status": "Message sent successfully"
        }
        
        ```
        
    
    ### Error Responses
    
    1. **405 Method Not Allowed**
        - **Condition**: The request method is not `POST`.
        - **Example**:
            
            ```json
            "Method not allowed"
            
            ```
            
    2. **400 Bad Request**
        - **Condition**: The request body is invalid (e.g., missing required fields, invalid types).
        - **Example**:
            
            ```json
            {
              "error": [
                {
                  "message": "Invalid URL",
                  "path": ["webhookUrl"]
                },
                {
                  "message": "Message cannot be empty",
                  "path": ["message"]
                }
              ]
            }
            
            ```
            
    3. **500 Internal Server Error**
        - **Condition**: An error occurred during processing, or the Discord webhook returned an error.
        - **Example**:
            
            ```json
            {
              "error": "Failed to send message: Invalid Webhook Token"
            }
            
            ```
            
    
    ## Implementation Details
    
    ### Input Validation
    
    The function uses the `zod` library to validate the request body:
    
    - Ensures `webhookUrl` is a valid string.
    - Ensures `message` is a non-empty string.
    
    If validation fails, a `400 Bad Request` response is returned with details about the validation errors.
    
    ### Sending the Message
    
    1. The function sends a `POST` request to the provided `webhookUrl`.
    2. The request body includes the `message` as the `content` field in JSON format.
    
    ### Error Handling
    
    - If the Discord webhook returns an error, the function captures and returns the error text in the response.
    - Any unexpected server error results in a `500 Internal Server Error` response.
    
    ## Example Usage
    
    ### Request
    
    ```
    POST /api/discord/new-message HTTP/1.1
    Content-Type: application/json
    
    {
      "webhookUrl": "https://discord.com/api/webhooks/1234567890/abcdefghij",
      "message": "Hello, Discord!"
    }
    
    ```
    
    ### Successful Response
    
    ```json
    {
      "status": "Message sent successfully"
    }
    
    ```
    
    ### Error Response (Invalid Body)
    
    ```json
    {
      "error": [
        {
          "message": "Message cannot be empty",
          "path": ["message"]
        }
      ]
    }
    
    ```
    
    ---
    
    ## Notes
    
    - The `webhookUrl` must be a valid Discord webhook URL. Ensure it is correctly configured in Discord.
    - Keep the `webhookUrl` secret, as anyone with access to it can send messages to the channel.
