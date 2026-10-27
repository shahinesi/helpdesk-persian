import assert from "node:assert/strict";
import test from "node:test";
import { localizeDashboardChartLabels } from "../src/utils/localizeDashboardChartLabels.ts";

const formatOption = (doctype, option) =>
  doctype === "Tag" && option === "First Ticket" ? "اولین تیکت" : option;

test("localizes top tag axis values without mutating API data", () => {
  const apiChart = {
    key: "top_tags",
    xAxis: { key: "tag", title: "Tag" },
    data: [{ tag: "First Ticket", Tickets: 3 }],
  };

  const chart = localizeDashboardChartLabels(apiChart, formatOption);

  assert.equal(chart.data[0].tag, "اولین تیکت");
  assert.deepEqual(apiChart.data, [{ tag: "First Ticket", Tickets: 3 }]);
});

test("localizes tag-trend series names and preserves series metadata", () => {
  const apiChart = {
    key: "tag_trend",
    series: [{ name: "First Ticket", type: "bar", stackName: "tags" }],
  };

  const chart = localizeDashboardChartLabels(apiChart, formatOption);

  assert.deepEqual(chart.series, [
    { name: "اولین تیکت", type: "bar", stackName: "tags" },
  ]);
  assert.equal(apiChart.series[0].name, "First Ticket");
});

test("leaves English labels and non-tag charts unchanged", () => {
  const apiChart = {
    key: "tickets_by_type",
    data: [{ name: "Question", value: 2 }],
    series: [{ name: "Question", type: "bar" }],
  };

  assert.deepEqual(localizeDashboardChartLabels(apiChart, formatOption), apiChart);
});
