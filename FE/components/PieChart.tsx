"use client";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ChartPieItem = {
  name: string;
  value: number;
  fill?: string;
};

export function ChartPieSimple({
  chartData,
  chartConfig,
  title,
  datakey,
  namakey,
  children,
}: {
  chartData: ChartPieItem[];
  chartConfig: ChartConfig;
  title?: string;
  datakey: string;
  namakey: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex justify-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[480px] aspect-square px-0 overflow-visible"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey={datakey}
              nameKey={namakey}
              labelLine={false}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="var(--foreground)"
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">{children}</CardFooter>
    </Card>
  );
}
