export function setupGlobalErrorHandlers() {
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION", err);
  });

  process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION", err);
  });
}