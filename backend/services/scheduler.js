import cron from "node-cron";
import { runAnalysisPipeline } from "./pipelineServices.js";

let running = false;

export function startScheduler() {

  console.log(
    "Scheduler started"
  );


  // Every 5 minutes
  cron.schedule(
    "*/4 * * * *",
    async () => {

      if (running) {

        console.log(
          "Previous pipeline still running. Skipping..."
        );

        return;
      }


      running = true;


      try {

        await runAnalysisPipeline();

      }
      catch(error) {

        console.error(
          "Scheduled job failed:",
          error
        );

      }
      finally {

        running = false;

      }

    }
  );

}