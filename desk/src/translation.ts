import { frappeRequest } from "frappe-ui";
import type { App } from "vue";
import { reactive } from "vue";

const translatedMessages = reactive<Record<string, string>>({});
let translationsPromise: Promise<void> | undefined;

function getTranslatedMessage(message: string): string {
  return translatedMessages[message] || message;
}

type Replacement = string | number;

function translate(message: string): string;
function translate(message: string, ...args: Replacement[]): string;
function translate(message: string, args: Replacement[]): string;
function translate(
  message: string,
  ...args: (Replacement | Replacement[])[]
): string {
  const translatedMessage = getTranslatedMessage(message);
  const values = args.flat();
  if (values.length === 0) {
    return translatedMessage;
  }
  return translatedMessage.replace(/{(\d+)}/g, function (match, index) {
    const value = values[Number(index)];
    return value === undefined ? match : String(value);
  });
}

export const __ = translate;

export function loadTranslations(): Promise<void> {
  if (!translationsPromise) {
    translationsPromise = frappeRequest({
      url: "helpdesk.api.general.get_translations",
      method: "GET",
    })
      .then((messages: Record<string, string>) => {
        Object.assign(translatedMessages, messages);
        (window as any).translatedMessages = translatedMessages;
      })
      .catch((error) => {
        translationsPromise = undefined;
        throw error;
      });
  }
  return translationsPromise;
}

export function translationPlugin(app: App<Element>) {
  app.config.globalProperties.__ = translate;
  (window as any).__ = translate;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    __: typeof translate;
  }
}
