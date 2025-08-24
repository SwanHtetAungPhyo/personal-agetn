
import { Mastra } from '@mastra/core/mastra';

import { LibSQLStore } from '@mastra/libsql';
import {logger} from "./utils/logger";
import {stockAgent} from "./agents/stockagent";
import mainWorkflow from "./workflows/logworkflow";
import {webSummarizationAgent} from "./agents/webSummerization";

export const mastra = new Mastra({
  workflows: {mainWorkflow: mainWorkflow},
  agents: { stockAgent,webSummarizationAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: logger,
});
