const AWS = require("aws-sdk");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const AWSXRay = require("aws-xray-sdk");

AWS.config.update({ region: "us-east-1" }); // Set your region
const dynamoDB = AWSXRay.captureAWSClient(new AWS.DynamoDB.DocumentClient());

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m";

exports.handler = async (event) => {
    console.log("Event received:", JSON.stringify(event, null, 2));

    try {
        const segment = AWSXRay.getSegment();
        const subsegment = segment.addNewSubsegment("Fetching Weather Data");

        // Fetch weather data from Open-Meteo API
        const response = await axios.get(WEATHER_API_URL);
        subsegment.close();

        const weatherData = response.data;

        // Prepare item for DynamoDB
        const item = {
            id: uuidv4(),
            forecast: {
                elevation: weatherData.elevation,
                generationtime_ms: weatherData.generationtime_ms,
                hourly: {
                    temperature_2m: weatherData.hourly.temperature_2m,
                    time: weatherData.hourly.time
                },
                hourly_units: {
                    temperature_2m: weatherData.hourly_units.temperature_2m,
                    time: weatherData.hourly_units.time
                },
                latitude: weatherData.latitude,
                longitude: weatherData.longitude,
                timezone: weatherData.timezone,
                timezone_abbreviation: weatherData.timezone_abbreviation,
                utc_offset_seconds: weatherData.utc_offset_seconds
            }
        };

        // Store data in DynamoDB
        const params = {
            TableName: "Weather",
            Item: item
        };

        await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Weather data stored successfully!", data: item })
        };
    } catch (error) {
        console.error("Error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to store weather data", error: error.message })
        };
    }
};
