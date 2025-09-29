export function getUserId() {
  if (typeof window === "undefined") return null; // SSR safe

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = crypto.randomUUID(); // unique id banayega
    localStorage.setItem("userId", userId);
    // cosnole.log("New userId generated:", userId);
  }
  return userId;
}
