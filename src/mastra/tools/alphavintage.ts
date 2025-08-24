import { createTool } from "@mastra/core";
import { z } from "zod";
import axios from "axios";
import { logger } from "../utils/logger";

const AlphaVantageUrl = 'https://www.alphavantage.co/query';
const apiKey = '8C3N9TCGCM0ZYB2O';

export const AlphaVintageNews = createTool({
    id: 'AlphaVintageNews',
    description: 'Get news sentiment data for stocks from AlphaVantage',
    inputSchema: z.object({
        ticker: z.string().describe('Stock ticker symbol (e.g., AAPL, TSLA)'),
    }),
    outputSchema: z.any(),
    execute: async ({ context }) => {
        try {
            if (!AlphaVantageUrl || !apiKey) {
                throw new Error("Missing ALPHA_URL or ALPHA_API_KEY environment variables");
            }

            const api = new URL(AlphaVantageUrl);
            api.searchParams.set("function", "NEWS_SENTIMENT");
            api.searchParams.set("tickers", context.ticker);
            api.searchParams.set("apikey", apiKey);

            logger.info(api.toString());
            const response = await axios.get(api.toString());
            logger.info("News API call successful");

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                logger.error("Error in AlphaVantage news call: " + error.message);
            } else {
                logger.error("Unknown error in AlphaVantage news call: " + String(error));
            }
            throw error;
        }
    }
});


export const AlphaVintagePrice = createTool({
    id: 'AlphaVintagePrice',
    description: 'Get daily price data for stocks or cryptocurrencies from AlphaVantage',
    inputSchema: z.object({
        symbol: z.string().describe('Stock symbol (e.g., AAPL) or crypto symbol (e.g., BTC)'),
        market: z.string().optional().describe('Market for crypto (e.g., USD, EUR) - required for crypto symbols'),
        isCrypto: z.boolean().optional().describe('Set to true if fetching cryptocurrency data'),
    }),
    outputSchema: z.any(),
    execute: async ({ context }) => {
        try {
            if (!AlphaVantageUrl || !apiKey) {
                throw new Error("Missing ALPHA_URL or ALPHA_API_KEY environment variables");
            }

            const api = new URL(AlphaVantageUrl);

            if (context.isCrypto) {
                api.searchParams.set("function", "DIGITAL_CURRENCY_DAILY");
                api.searchParams.set("symbol", context.symbol);
                api.searchParams.set("market", context.market || "USD");
            } else {
                api.searchParams.set("function", "TIME_SERIES_DAILY");
                api.searchParams.set("symbol", context.symbol);
            }

            api.searchParams.set("apikey", apiKey);

            logger.info(api.toString());
            const response = await axios.get(api.toString());
            logger.info("Price API call successful");

            return response.data;
        } catch (error) {
            if (error instanceof Error) {
                logger.error("Error in AlphaVantage price call: " + error.message);
            } else {
                logger.error("Unknown error in AlphaVantage price call: " + String(error));
            }
            throw error;
        }
    }
});