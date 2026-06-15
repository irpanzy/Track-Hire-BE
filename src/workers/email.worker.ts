import { consumeQueue, QUEUES } from "../utils/rabbitmq";
import { sendEmail } from "../utils/email";

interface EmailJob {
  to: string;
  subject: string;
  html: string;
}

export async function startEmailWorker() {
  console.log("🚀 Starting email worker...");

  await consumeQueue(QUEUES.EMAIL_JOBS, async (job: EmailJob) => {
    console.log(`📧 Processing email job for: ${job.to}`);

    try {
      await sendEmail({
        to: job.to,
        subject: job.subject,
        html: job.html,
      });

      console.log(`✅ Email sent successfully to: ${job.to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${job.to}:`, error);
      throw error;
    }
  });

  console.log("✅ Email worker started successfully");
}
