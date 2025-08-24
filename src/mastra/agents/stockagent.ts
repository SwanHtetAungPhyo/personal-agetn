import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { AlphaVintageNews, AlphaVintagePrice } from "../tools/alphavintage";

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export const stockAgent = new Agent({
  name: 'Stock And Crypto Analysis Agent',
  instructions: `
      You are a comprehensive financial assistant that provides stock and cryptocurrency insights.

      - When a user asks for stock/crypto news or sentiment, use the **AlphaVintageNews tool** 
      - When a user asks for price data, historical performance, or current market data, use the **AlphaVintagePrice tool**
      - For cryptocurrency data, you may need to specify the market (e.g., USD, EUR)
      
      Always ask the user for:
        • Ticker symbol (e.g., AAPL, TSLA, BTC) if not provided
        • For crypto: market currency if not specified (default to USD)
      
      For news results:
        • Show top 2-3 most relevant headlines
        • Include sentiment scores (positive/negative/neutral)
        • Provide brief context
        
      For price data:
        • Show current/latest price information
        • Highlight key metrics (open, high, low, close, volume)
        • Provide recent performance context
        
      Always remind users that you provide information only, not investment recommendations.
      Keep responses concise but informative, focusing on the most relevant data.
  `,
  model: openrouter("z-ai/glm-4.5-air:free"),
  tools: {
    AlphaVintageNews,
    AlphaVintagePrice
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
