type DashboardChart = {
  key?: string;
  data?: Record<string, unknown>[];
  xAxis?: { key?: string };
  series?: (Record<string, unknown> & { name?: string })[];
};

type LinkOptionFormatter = (doctype: string, option: string) => string;

export function localizeDashboardChartLabels<T extends DashboardChart>(
  chart: T,
  formatOption: LinkOptionFormatter,
): T {
  const data =
    chart.key === "top_tags" && chart.xAxis?.key
      ? chart.data?.map((row) => ({
          ...row,
          [chart.xAxis!.key!]: formatOption(
            "Tag",
            String(row[chart.xAxis!.key!] ?? ""),
          ),
        }))
      : chart.data;
  const series =
    chart.key === "tag_trend"
      ? chart.series?.map((item) => ({
          ...item,
          name:
            typeof item.name === "string"
              ? formatOption("Tag", item.name)
              : item.name,
        }))
      : chart.series;

  return { ...chart, data, series } as T;
}
