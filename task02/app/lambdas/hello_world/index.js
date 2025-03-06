exports.handler = async (event) => {

    const path = event?.rawPath || "Unknown";

    const method = event?.requestContext?.http?.method || "Unknown";

    // Allow only GET /hello

    if (method === "GET" && path === "/hello") {

        return {

            statusCode: 200,

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({

                statusCode: 200,

                message: "Hello from Lambda"

            })

        };

    }

    // Return 400 Bad Request for all other cases

    return {

        statusCode: 400,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

            statusCode: 400,

            message: `Bad request syntax or unsupported method. Request path: ${path}. HTTP method: ${method}`

        })

    };

};

