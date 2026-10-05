import { createApp, h } from "vue";
import {
  Badge,
  Button,
  Dialog,
  ErrorMessage,
  FormControl,
  frappeRequest,
  FrappeUI,
  setConfig,
  TextInput,
  toast,
  Tooltip,
} from "frappe-ui";
import { createPinia } from "pinia";
import { spritePlugin } from "frappe-ui/experimental";
import "./index.css";
import { loadTranslations, translationPlugin } from "./translation";
import CircleAlert from "~icons/lucide/circle-alert";

const globalComponents = {
  Badge,
  Button,
  Dialog,
  ErrorMessage,
  FormControl,
  Tooltip,
  TextInput,
};

async function bootstrap() {
  await loadTranslations();

  const { isCustomerPortal } = await import("@/utils");

  // Keep server messages on resource fetches only; frappe-ui call() has its
  // own response handling and should stay silent.
  setConfig("resourceFetcher", (options) =>
    frappeRequest({ ...options, onServerMessages: showServerMessages })
  );
  setConfig("fallbackErrorHandler", (error) => {
    const msg = error.exc_type
      ? (error.messages || error.message || []).join(", ")
      : error.message;
    toast.error(msg);
  });

  // Import the app only after gettext is ready: several static option lists
  // call __() while their modules are evaluated.
  const [
    { default: App },
    { router },
    { telemetryPlugin },
    { initSocket },
    { createDialog },
  ] = await Promise.all([
    import("./App.vue"),
    import("./router"),
    import("@framework/ui"),
    import("./socket"),
    import("./components/dialogs"),
  ]);

  const app = createApp(App);
  app.use(FrappeUI);
  app.use(spritePlugin);
  app.use(createPinia());
  app.use(router);
  app.use(translationPlugin);
  app.use(telemetryPlugin, { app_name: "helpdesk" });

  for (const c in globalComponents) {
    app.component(c, globalComponents[c]);
  }

  app.config.globalProperties.$dialog = createDialog;
  app.config.globalProperties.$socket = initSocket();
  app.mount("#app");

  function showServerMessages(msgs) {
    if (isCustomerPortal.value) return;
    msgs.forEach((msg) => {
      msg = JSON.parse(msg);
      if (!msg || msg.alert) return;
      if (msg.message == "Feedback email has been sent to the customer.") {
        toast.success(msg.message);
        return;
      }
      toast(msg.message, {
        icon: () => h(CircleAlert, { class: "text-ink-blue-5" }),
      });
    });
  }
}

function showBootstrapError() {
  const root = document.querySelector("#app");
  if (!root) return;
  root.textContent =
    "بارگذاری زبان برنامه ناموفق بود. صفحه را دوباره بارگذاری کنید.";
  root.setAttribute("dir", "rtl");
}

if (import.meta.env.DEV) {
  frappeRequest({
    url: "/api/method/helpdesk.www.helpdesk.index.get_context_for_dev",
  })
    .then((values) => {
      for (let key in values) window[key] = values[key];
      if (window.dir) document.documentElement.dir = window.dir;
      if (window.lang) document.documentElement.lang = window.lang;
      return bootstrap();
    })
    .catch(showBootstrapError);
} else {
  bootstrap().catch(showBootstrapError);
}
