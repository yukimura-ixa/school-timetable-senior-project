export function toErrorMessage(value: unknown, fallback: string = ""): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value && typeof value === "object") {
    if ("message" in value) {
      const message = (value as { message?: unknown }).message;
      if (typeof message === "string") return message;
      if (message instanceof Error) return message.message;

      try {
        const json = JSON.stringify(message);
        if (typeof json === "string") return json;
      } catch {
        // ignore
      }
    }

    try {
      const json = JSON.stringify(value);
      if (typeof json === "string") return json;
    } catch {
      // ignore
    }
  }

  return fallback;
}

