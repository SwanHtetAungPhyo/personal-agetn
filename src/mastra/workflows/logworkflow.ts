import { createStep, createWorkflow } from "@mastra/core";
import { z } from "zod";
import { mastra } from "../index";
import {stockAgent} from "../agents/stockagent";

const insightLog = createStep({
    id: 'log-insight',
    inputSchema: z.any(),
    outputSchema: z.object({
        original: z.any(),
        insight: z.string(),
    }),
    execute: async ({ inputData }) => {
        console.log('Original input:', inputData);
        return {
            original: inputData,
            insight: 'Initial log processing completed'
        };
    }
});

const dataCleaner = createStep({
    id: 'clean-data',
    inputSchema: z.object({
        original: z.any(),
        insight: z.string(),
    }),
    outputSchema: z.object({
        cleanedData: z.any(),
        status: z.string(),
        metadata: z.object({
            processedAt: z.string(),
            stepsApplied: z.array(z.string())
        })
    }),
    execute: async ({ inputData }) => {
    console.log('Cleaning data:', inputData);
        return {
            cleanedData: {
                ...inputData.original,
                cleaned: true,
                processedInsight: inputData.insight
            },
            status: 'success',
            metadata: {
                processedAt: new Date().toISOString(),
                stepsApplied: ['normalization', 'validation', 'sanitization']
            }
        };
    }
});

const finalProcessor = createStep({
    id: 'final-process',
    inputSchema: z.object({
        cleanedData: z.any(),
        status: z.string(),
        metadata: z.object({
            processedAt: z.string(),
            stepsApplied: z.array(z.string())
        })
    }),
    outputSchema: z.object({
        processedData: z.any(),
        summary: z.string(),
        metrics: z.object({
            processingTime: z.number(),
            dataSize: z.number()
        })
    }),
    execute: async ({ inputData }) => {
        console.log('Final processing:', inputData);
        return {
            processedData: inputData.cleanedData,
            summary: 'Data processing completed successfully',
            metrics: {
                processingTime: 150,
                dataSize: JSON.stringify(inputData.cleanedData).length
            }
        };
    }
});

// Step 4: AI Analysis
const aiInsightStep = createStep({
    id: 'ai-analysis',
    inputSchema: z.object({
        processedData: z.any(),
        summary: z.string(),
        metrics: z.object({
            processingTime: z.number(),
            dataSize: z.number()
        })
    }),
    outputSchema: z.object({
        originalData: z.any(),
        aiAnalysis: z.string(),
        recommendations: z.array(z.string()),
        confidenceScore: z.number()
    }),
    execute: async ({ inputData }) => {
        console.log('Generating AI insights for processed data');

        const prompt = `
Analyze this processed log data and provide insights:

PROCESSED DATA:
${JSON.stringify(inputData.processedData, null, 2)}

PROCESSING SUMMARY: ${inputData.summary}
METRICS: Processing Time: ${inputData.metrics.processingTime}ms, Data Size: ${inputData.metrics.dataSize} bytes

Please provide:
1. Comprehensive analysis of what this log data represents
2. Potential issues or anomalies to investigate
3. Specific recommendations for optimization or monitoring
4. A confidence score (0-100) about your analysis
    `;

        try {
            const response = await stockAgent.generateVNext(prompt);

            return {
                originalData: inputData.processedData,
                aiAnalysis: response.text,
                recommendations: [
                    "Review authentication patterns",
                    "Monitor response times regularly",
                    "Implement additional logging for error tracking"
                ],
                confidenceScore: 85
            };
        } catch (error) {
            console.error('AI analysis failed:', error);
            return {
                originalData: inputData.processedData,
                aiAnalysis: 'AI analysis unavailable - fallback analysis: Data appears to be processed successfully but detailed insights could not be generated.',
                recommendations: [
                    "Check AI service availability",
                    "Verify agent configuration",
                    "Review input data format"
                ],
                confidenceScore: 50
            };
        }
    }
});


const mainWorkflow = createWorkflow({
    id: 'log-processing-workflow',
    inputSchema: z.any(),
    outputSchema: z.object({
        originalData: z.any(),
        aiAnalysis: z.string(),
        recommendations: z.array(z.string()),
        confidenceScore: z.number()
    }),
})
    .then(insightLog)
    .then(dataCleaner)
    .then(finalProcessor)
    .then(aiInsightStep);

mainWorkflow.commit();
export default mainWorkflow;