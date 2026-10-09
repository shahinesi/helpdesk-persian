(() => {
  const welcome = frappe.setup.slides_settings.find(
    (slide) => slide.name === "welcome"
  );
  if (!welcome) return;

  const fields = Object.fromEntries(
    welcome.fields.map((field) => [field.fieldname, field])
  );

  frappe.setup.on("before_load", () => {
    const language = frappe.setup.data.lang.codes_to_names[frappe.boot.lang];
    if (language) fields.language.default = language;

    const defaults = frappe.boot.sysdefaults || {};
    fields.country.default = defaults.country || "Iran";
    fields.timezone.default = defaults.time_zone || "Asia/Tehran";
    fields.currency.default = defaults.currency || "IRR";
  });

  const setupLanguageField = frappe.setup.utils.setup_language_field;
  frappe.setup.utils.setup_language_field = function (slide) {
    setupLanguageField.call(this, slide);
    if (!Intl.DisplayNames) return;

    const displayNames = new Intl.DisplayNames(["fa"], { type: "language" });
    const field = slide.get_field("language");
    field.df.options = field.df.options.map((option) => {
      try {
        return {
          ...option,
          label:
            displayNames.of(option.description.replaceAll("_", "-")) ||
            option.label,
        };
      } catch {
        return option;
      }
    });
    field.set_options();
  };

  const setupRegionFields = frappe.setup.utils.setup_region_fields;
  frappe.setup.utils.setup_region_fields = function (slide) {
    setupRegionFields.call(this, slide);

    const currency = slide.get_input("currency");
    const options = currency
      .find("option")
      .toArray()
      .map((option) => ({
        value: option.value,
        label:
          option.value === "IRR" ? __("IRR ({0})", [__("Rial")]) : option.value,
      }));
    currency.empty().add_options(options);
  };

  const initializeFields = welcome.initialize_fields;
  welcome.initialize_fields = function (slide) {
    initializeFields.call(this, slide);

    const values = frappe.wizard.values;
    const country = values.country || "Iran";
    const timezone = values.timezone || "Asia/Tehran";
    const currency = values.currency || "IRR";
    const persian = frappe.setup.data.lang.codes_to_names.fa;
    const hasRegionalValues = Boolean(
      values.country || values.timezone || values.currency
    );

    slide.get_field("country").set_input(country);
    slide.get_input("country").trigger("change");
    slide.get_field("timezone").set_input(timezone);
    slide.get_field("currency").set_input(currency);
    slide.get_input("timezone").attr("dir", "ltr");
    slide.get_input("currency").attr("dir", "ltr");
    slide.get_input("email").attr("dir", "ltr");
    slide.get_input("password").attr("dir", "ltr");

    if (
      (!values.language ||
        (values.language === "English" && !hasRegionalValues)) &&
      persian
    ) {
      slide.get_field("language").set_input(persian);
      frappe.call({
        method: "frappe.desk.page.setup_wizard.setup_wizard.load_messages",
        args: { language: persian },
      });
    }
  };

  frappe.setup.SetupWizard.prototype.cycle_hello = function () {
    this.$intro
      .find(".setup-intro__hello")
      .text(__("Hello"))
      .attr("lang", "fa");
  };
})();
