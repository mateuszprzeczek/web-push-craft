export interface DashboardStats {
  summary: {
    totalSubscriptions: number;
    totalClicks: number;
    totalDisplays: number;
    subscriptions: ChartSection;
    clicks: ChartSection;
    displays: ChartSection;
  };
}

export interface ChartSection {
  labels: Array<string>;
  data: Array<number>;
}
